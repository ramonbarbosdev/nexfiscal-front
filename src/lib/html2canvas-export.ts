import { toPng } from "html-to-image";

export type CaptureOptions = {
  pixelRatio?: number;
  backgroundColor?: string;
};

const CLIP_PROPS = new Set([
  "height",
  "max-height",
  "min-height",
  "max-width",
  "overflow",
  "overflow-x",
  "overflow-y",
  "transform",
]);

function resolveBackgroundColor(element: HTMLElement): string {
  const bg = window.getComputedStyle(element).backgroundColor;
  if (!bg || bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
    return "#ffffff";
  }
  return bg;
}

function copyComputedStyles(source: HTMLElement, target: HTMLElement, skipClipProps = false) {
  const computed = window.getComputedStyle(source);
  for (let i = 0; i < computed.length; i++) {
    const prop = computed.item(i);
    if (skipClipProps && CLIP_PROPS.has(prop)) continue;
    target.style.setProperty(prop, computed.getPropertyValue(prop), computed.getPropertyPriority(prop));
  }
}

function measureElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    width: Math.ceil(Math.max(element.scrollWidth, element.offsetWidth, rect.width)),
    height: Math.ceil(Math.max(element.scrollHeight, element.offsetHeight, rect.height)),
  };
}

async function waitForLayout() {
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
    ),
  );
}

/**
 * Clona o elemento para fora do Dialog (evita transform do Radix quebrar a captura)
 * e aplica estilos computados em rgb para máxima compatibilidade.
 */
async function createExportClone(source: HTMLElement): Promise<{ wrapper: HTMLDivElement; clone: HTMLElement }> {
  const { width, height } = measureElement(source);
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;overflow:visible;";

  const clone = source.cloneNode(true) as HTMLElement;
  copyComputedStyles(source, clone, true);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.maxHeight = "none";
  clone.style.maxWidth = `${width}px`;
  clone.style.overflow = "visible";
  clone.style.transform = "none";
  clone.style.boxSizing = "border-box";

  const sourceNodes = [source, ...source.querySelectorAll("*")];
  const cloneNodes = [clone, ...clone.querySelectorAll("*")];

  sourceNodes.forEach((liveEl, index) => {
    const cloneEl = cloneNodes[index];
    if (liveEl instanceof HTMLElement && cloneEl instanceof HTMLElement) {
      copyComputedStyles(liveEl, cloneEl);
    }
    if (liveEl instanceof HTMLImageElement && cloneEl instanceof HTMLImageElement && liveEl.src) {
      cloneEl.src = liveEl.src;
      cloneEl.crossOrigin = "anonymous";
    }
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  await waitForLayout();
  await waitForImages(clone);

  return { wrapper, clone };
}

/**
 * Exporta um elemento como PNG via renderização nativa do browser (SVG foreignObject).
 * Suporta oklch() e funciona mesmo dentro de modais com transform.
 */
export async function captureElementAsDataUrl(
  element: HTMLElement,
  options: CaptureOptions = {},
): Promise<string> {
  const { pixelRatio = 2, backgroundColor = resolveBackgroundColor(element) } = options;
  const { wrapper, clone } = await createExportClone(element);

  try {
    await waitForLayout();
    return await toPng(clone, {
      cacheBust: true,
      pixelRatio,
      backgroundColor,
      skipFonts: true,
      style: {
        transform: "none",
        overflow: "visible",
      },
    });
  } finally {
    wrapper.remove();
  }
}

export async function downloadElementAsPng(
  element: HTMLElement,
  filename: string,
  options?: CaptureOptions,
) {
  const dataUrl = await captureElementAsDataUrl(element, options);
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
