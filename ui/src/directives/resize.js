function throttle (f, delay) {
    let timer = 0
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(() => f.apply(this, args), delay)
    }
}

const resize = {
    mounted (el, binding) {
        const fcn = binding.value
        const observer = new ResizeObserver(throttle(() => {
            fcn(el)
        }, 50))
        observer.observe(el)
    }
}

export default resize
