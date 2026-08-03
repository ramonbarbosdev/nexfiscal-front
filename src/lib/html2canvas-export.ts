import html2canvas, { type Options as Html2CanvasOptions } from "html2canvas";

/**
 * html2canvas não entende oklch() (usado no tema Tailwind).
 * Antes da captura, remove folhas de estilo do clone e copia os estilos
 * computados (já resolvidos pelo browser em rgb) como inline.
 */
function copyComputedStyles(source: HTMLElement, target: HTMLElement) {
  const computed = window.getComputedStyle(source);
  for (let i = 0; i < computed.length; i++) {
    const prop = computed.item(i);
    target.style.setProperty(prop, computed.getPropertyValue(prop), computed.getPropertyPriority(prop));
  }
}

function prepareCloneForCapture(source: HTMLElement, clonedRoot: HTMLElement, clonedDoc: Document) {
  clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => node.remove());

  const liveNodes = [source, ...source.querySelectorAll("*")];
  const clonedNodes = [clonedRoot, ...clonedRoot.querySelectorAll("*")];

  liveNodes.forEach((liveEl, index) => {
    const cloneEl = clonedNodes[index];
    if (liveEl instanceof HTMLElement && cloneEl instanceof HTMLElement) {
      copyComputedStyles(liveEl, cloneEl);
    }
  });
}

export async function captureElementAsCanvas(
  element: HTMLElement,
  options: Partial<Html2CanvasOptions> = {},
) {
  const { onclone: userOnClone, ...rest } = options;

  return html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    ...rest,
    onclone: (clonedDoc, clonedNode) => {
      prepareCloneForCapture(element, clonedNode, clonedDoc);
      userOnClone?.(clonedDoc, clonedNode);
    },
  });
}

export async function downloadElementAsPng(element: HTMLElement, filename: string) {
  const canvas = await captureElementAsCanvas(element);
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
