import { Component, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';
import { KeyboardDetector } from '../../utilities/keyboard-detector';

/**
 * @slot - The alert's content.
 * @slot icon - An icon to show in the alert.
 * @slot close-icon - An icon to use in lieu of the default close icon.
 */

@Component({
  tag: 'sl-alert',
  styleUrl: 'alert.scss',
  shadow: true
})
export class Tab {
  alert: HTMLElement;
  keyboardDetector: KeyboardDetector;

  constructor() {
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
  }

  @State() isUsingKeyboard = false;

  /** The type of alert to draw. */
  @Prop() type = 'primary';

  /** Set to true to make the alert closable. */
  @Prop() closable = false;

  /** Set to true to close the alert. */
  @Prop({ mutable: true }) closed = false;

  /** Emitted when the alert is closed. */
  @Event() slClose: EventEmitter;

  @Watch('closed')
  handleClosedChange() {
    // Remove the hidden attribute so the transition can run
    this.alert.removeAttribute('hidden');

    if (this.closed) {
      this.slClose.emit();
    }
  }

  componentDidLoad() {
    this.keyboardDetector = new KeyboardDetector({
      whenUsing: () => (this.isUsingKeyboard = true),
      whenNotUsing: () => (this.isUsingKeyboard = false)
    });
    this.keyboardDetector.observe(this.alert);
  }

  componentDidUnload() {
    this.keyboardDetector.unobserve(this.alert);
  }

  handleCloseClick() {
    this.closed = true;
  }

  handleTransitionEnd() {
    // Hide the alert when the transition ends
    if (this.closed) {
      this.alert.setAttribute('hidden', 'true');
    }
  }

  render() {
    return (
      <div
        ref={el => (this.alert = el)}
        class={{
          'sl-alert': true,
          'sl-alert--closable': this.closable,
          'sl-alert--closed': this.closed,
          'sl-alert--using-keyboard': this.isUsingKeyboard,

          // States
          'sl-alert--primary': this.type === 'primary',
          'sl-alert--success': this.type === 'success',
          'sl-alert--info': this.type === 'info',
          'sl-alert--warning': this.type === 'warning',
          'sl-alert--danger': this.type === 'danger'
        }}
        role="alert"
        aria-hidden={this.closed}
        onTransitionEnd={this.handleTransitionEnd}
      >
        <span class="sl-alert__icon">
          <slot name="icon" />
        </span>

        <span class="sl-alert__body">
          <slot />
        </span>

        {this.closable && (
          <button type="button" class="sl-alert__close" onClick={this.handleCloseClick}>
            <slot name="close-icon">
              <sl-icon name="x" />
            </slot>
          </button>
        )}
      </div>
    );
  }
}
