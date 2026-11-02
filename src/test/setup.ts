// jsdom has no canvas implementation; simulations guard against a null context.
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement['getContext']
window.scrollTo = (() => {}) as typeof window.scrollTo
Element.prototype.scrollIntoView = function () {}
