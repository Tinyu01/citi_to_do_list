// Animation System for TaskFlow
class AnimationSystem {
    constructor() {
        this.animations = new Map();
        this.animationQueue = new Map();
        this.defaultDuration = 300;
        this.defaultEasing = 'ease-in-out';
    }

    // Animation Presets
    static presets = {
        fadeIn: [
            { opacity: 0 },
            { opacity: 1 }
        ],
        fadeOut: [
            { opacity: 1 },
            { opacity: 0 }
        ],
        slideIn: [
            { transform: 'translateY(-20px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
        ],
        slideOut: [
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(20px)', opacity: 0 }
        ],
        scaleIn: [
            { transform: 'scale(0.8)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 }
        ],
        scaleOut: [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0.8)', opacity: 0 }
        ],
        shake: [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(-3px)' },
            { transform: 'translateX(3px)' },
            { transform: 'translateX(0)' }
        ],
        pulse: [
            { transform: 'scale(1)' },
            { transform: 'scale(1.05)' },
            { transform: 'scale(1)' }
        ],
        highlight: [
            { backgroundColor: 'transparent' },
            { backgroundColor: 'var(--highlight-color)' },
            { backgroundColor: 'transparent' }
        ]
    };

    // Task-specific animations
    static taskAnimations = {
        create: {
            keyframes: [
                { transform: 'translateY(-20px)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 }
            ],
            options: {
                duration: 300,
                easing: 'ease-out'
            }
        },
        delete: {
            keyframes: [
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(0.8)', opacity: 0 }
            ],
            options: {
                duration: 300,
                easing: 'ease-in'
            }
        },
        update: {
            keyframes: [
                { transform: 'scale(1)', filter: 'brightness(1)' },
                { transform: 'scale(1.02)', filter: 'brightness(1.1)' },
                { transform: 'scale(1)', filter: 'brightness(1)' }
            ],
            options: {
                duration: 500,
                easing: 'ease-in-out'
            }
        },
        move: {
            keyframes: [
                { transform: 'translateX(0)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ],
            options: {
                duration: 400,
                easing: 'ease-in-out'
            }
        },
        complete: {
            keyframes: [
                { filter: 'grayscale(0)' },
                { filter: 'grayscale(1)' }
            ],
            options: {
                duration: 300,
                easing: 'linear'
            }
        },
        error: {
            keyframes: [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)', backgroundColor: 'var(--error-color-light)' },
                { transform: 'translateX(5px)', backgroundColor: 'var(--error-color-light)' },
                { transform: 'translateX(-3px)', backgroundColor: 'transparent' },
                { transform: 'translateX(0)', backgroundColor: 'transparent' }
            ],
            options: {
                duration: 500,
                easing: 'ease-in-out'
            }
        }
    };

    // Main animation method
    async animate(element, type, options = {}) {
        if (!element) return Promise.reject(new Error('Element is required'));

        const animation = this.getAnimation(type);
        if (!animation) return Promise.reject(new Error(`Animation "${type}" not found`));

        const { keyframes, defaultOptions } = animation;
        const finalOptions = { ...defaultOptions, ...options };

        // Cancel any existing animations on this element
        this.cancelAnimation(element);

        return new Promise((resolve, reject) => {
            try {
                const anim = element.animate(keyframes, finalOptions);
                this.animations.set(element, anim);

                anim.onfinish = () => {
                    this.animations.delete(element);
                    resolve();
                };

                anim.oncancel = () => {
                    this.animations.delete(element);
                    reject(new Error('Animation cancelled'));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Queue animations for sequential execution
    async queueAnimation(element, type, options = {}) {
        if (!this.animationQueue.has(element)) {
            this.animationQueue.set(element, Promise.resolve());
        }

        const queue = this.animationQueue.get(element);
        const newAnimation = queue.then(() => this.animate(element, type, options));
        
        this.animationQueue.set(element, newAnimation);
        return newAnimation;
    }

    // Cancel ongoing animations
    cancelAnimation(element) {
        const currentAnimation = this.animations.get(element);
        if (currentAnimation) {
            currentAnimation.cancel();
            this.animations.delete(element);
        }
    }

    // Get animation configuration
    getAnimation(type) {
        if (AnimationSystem.taskAnimations[type]) {
            return {
                keyframes: AnimationSystem.taskAnimations[type].keyframes,
                defaultOptions: {
                    duration: this.defaultDuration,
                    easing: this.defaultEasing,
                    ...AnimationSystem.taskAnimations[type].options
                }
            };
        }

        if (AnimationSystem.presets[type]) {
            return {
                keyframes: AnimationSystem.presets[type],
                defaultOptions: {
                    duration: this.defaultDuration,
                    easing: this.defaultEasing
                }
            };
        }

        return null;
    }

    // Task-specific animation methods
    async animateTaskCreation(taskElement) {
        await this.animate(taskElement, 'create');
        await this.animate(taskElement.querySelector('.task-meta'), 'fadeIn', { delay: 100 });
    }

    async animateTaskDeletion(taskElement) {
        await this.animate(taskElement, 'delete');
    }

    async animateTaskUpdate(taskElement) {
        await this.animate(taskElement, 'update');
    }

    async animateTaskMove(taskElement, direction = 'horizontal') {
        const animation = direction === 'horizontal' ? 'move' : 'slideIn';
        await this.animate(taskElement, animation);
    }

    async animateTaskComplete(taskElement) {
        await this.animate(taskElement, 'complete');
    }

    async animateTaskError(taskElement) {
        await this.animate(taskElement, 'error');
    }

    // Utility animations
    async animateProgressBar(element, fromValue, toValue) {
        const duration = 1000;
        const start = performance.now();

        return new Promise(resolve => {
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentValue = fromValue + (toValue - fromValue) * progress;
                element.style.width = `${currentValue}%`;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    async animateNumber(element, fromValue, toValue, duration = 1000) {
        const start = performance.now();

        return new Promise(resolve => {
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentValue = Math.round(fromValue + (toValue - fromValue) * progress);
                element.textContent = currentValue;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }
}

// Initialize animation system
document.addEventListener('DOMContentLoaded', () => {
    window.animationSystem = new AnimationSystem();
});