import { Component } from '@theme/component';
import { fetchConfig } from '@theme/utilities';
import { CartAddEvent } from '@theme/events';

/**
 * @typedef {object} ProductTitleAddToCartRefs
 * @property {HTMLButtonElement} addToCartButton - The add to cart button.
 *
 * @extends Component<ProductTitleAddToCartRefs>
 */
export class ProductTitleAddToCart extends Component {
  requiredRefs = ['addToCartButton'];

  /** @type {number | undefined} */
  #animationTimeout;

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.#animationTimeout) clearTimeout(this.#animationTimeout);
  }

  /**
   * Handles quick add button click
   * @param {Event} event - The click event
   */
  handleClick = async (event) => {
    const { addToCartButton } = this.refs;
    const { variantId, productId } = this.dataset;

    event.preventDefault();

    if (!variantId || addToCartButton.disabled) return;

    addToCartButton.disabled = true;
    addToCartButton.classList.add('loading');

    try {
      const formData = new FormData();
      formData.append('id', variantId);
      formData.append('quantity', '1');

      const fetchCfg = fetchConfig('javascript', { body: formData });

      const response = await fetch(Theme.routes.cart_add_url, {
        ...fetchCfg,
        headers: {
          ...fetchCfg.headers,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status || data.error) {
        console.error('Add to cart failed:', data.message || data.description);
        this.showError(data.message || 'Failed to add item to cart');
      } else {
        this.dispatchEvent(
          new CartAddEvent(data, this.id, {
            source: 'product-title-add-to-cart',
            productId: productId,
            variantId: variantId,
            itemCount: 1,
          })
        );

        this.showSuccess();
      }
    } catch (error) {
      console.error(error);
      this.showError('Failed to add item to cart');
    } finally {
      addToCartButton.disabled = false;
      addToCartButton.classList.remove('loading');
    }
  }

  showSuccess() {
    const { addToCartButton } = this.refs;

    addToCartButton.classList.add('success');

    if (this.#animationTimeout) clearTimeout(this.#animationTimeout);

    this.#animationTimeout = setTimeout(() => {
      addToCartButton.classList.remove('success');
    }, 2000);
  }

  /**
   * @param {string} message - Error message
   */
  showError(message) {
    const { addToCartButton } = this.refs;

    addToCartButton.classList.add('error');
    console.warn(message);

    setTimeout(() => {
      addToCartButton.classList.remove('error');
    }, 2000);
  }
}

if (!customElements.get('product-title-add-to-cart')) {
  customElements.define('product-title-add-to-cart', ProductTitleAddToCart);
}
