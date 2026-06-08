import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {formatDateTime} from '../utils/format.js';

const EVENT_TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant'
];

export default class EditEventView extends AbstractStatefulView {

  constructor(
    point,
    destination,
    offers,
    destinations,
    isNewPoint = false
  ) {
    super();

    this._callback = {};

    this._allDestinations = destinations;

    this._isNewPoint = isNewPoint;

    this._state = {
      point,
      destination,
      offers,

      isDisabled: false,
      isSaving: false,
      isDeleting: false
    };

    this.setFormSubmitHandler = this.setFormSubmitHandler.bind(this);
    this.setRollupClickHandler = this.setRollupClickHandler.bind(this);

    this.setDestinationChangeHandler();
    this.setTypeChangeHandler();
    this.setOffersChangeHandler();
  }

  getOffersTemplate() {
    const offersByType = this._state.offers.find(
      (o) => o.type === this._state.point.type
    );

    if (!offersByType) {
      return '';
    }

    return offersByType.offers.map((offer) => {
      const isChecked = this._state.point.offers.includes(offer.id);

      return `
        <div class="event__offer-selector">
          <input class="event__offer-checkbox visually-hidden"
            id="offer-${offer.id}"
            type="checkbox"
            ${isChecked ? 'checked' : ''}>
          <label class="event__offer-label" for="offer-${offer.id}">
            <span class="event__offer-title">${offer.title}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>
      `;
    }).join('');
  }

  getPicturesTemplate() {
    return this._state.destination.pictures.map((picture) => `
      <img
        class="event__photo"
        src="${picture.src}"
        alt="${picture.description}"
      >
    `).join('');
  }

  getEventTypesTemplate() {
    return EVENT_TYPES.map((type) => `
      <div class="event__type-item">

        <input
          id="event-type-${type}-1"
          class="event__type-input visually-hidden"
          type="radio"
          name="event-type"
          value="${type}"
          ${this._state.point.type === type ? 'checked' : ''}
        >

        <label
          class="event__type-label event__type-label--${type}"
          for="event-type-${type}-1"
        >
          ${type.charAt(0).toUpperCase() + type.slice(1)}
        </label>

      </div>
    `).join('');
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;

    this.element.querySelector('form')
      .addEventListener('submit', this._callback.formSubmit);
  }

  setRollupClickHandler(callback) {
    this._callback.rollupClick = callback;

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this._callback.rollupClick);
  }

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;

    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this._callback.deleteClick);
  }

  setDestinationChangeHandler() {
    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.destinationChangeHandler);
  }

  setTypeChangeHandler() {

    this.element
      .querySelectorAll('.event__type-input')
      .forEach((input) => {

        input.addEventListener(
          'change',
          this.typeChangeHandler
        );
      });
  }

  setOffersChangeHandler() {

    this.element
      .querySelectorAll('.event__offer-checkbox')
      .forEach((checkbox) => {

        checkbox.addEventListener('change', this.offerChangeHandler);
      });
  }

  setPriceInputHandler() {

    this.element
      .querySelector('.event__input--price')
      .addEventListener('input', (evt) => {

        evt.target.value = evt.target.value.replace(/\D/g, '');

        this._state.point.basePrice = Number(evt.target.value);
      });
  }

  setDatepicker() {

    flatpickr(
      this.element.querySelector('.event__input--time-start'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        clickOpens: true,
        allowInput: true,

        onChange: ([userDate]) => {
          this._state.point.dateFrom = userDate.toISOString();
        }
      }
    );

    flatpickr(
      this.element.querySelector('.event__input--time-end'),
      {
        dateFormat: 'd/m/y H:i',
        enableTime: true,
        'time_24hr': true,
        clickOpens: true,
        allowInput: true,

        onChange: ([userDate]) => {
          this._state.point.dateTo = userDate.toISOString();
        }
      }
    );
  }

  typeChangeHandler = (evt) => {
    evt.preventDefault();

    this.updateElement({
      point: {
        ...this._state.point,
        type: evt.target.value,
        offers: []
      }
    });
  };

  destinationChangeHandler = (evt) => {
    evt.preventDefault();

    const foundDestination = this._allDestinations
      .find((item) => item.name === evt.target.value);

    if (!foundDestination) {
      return;
    }

    this.updateElement({
      destination: foundDestination,
      point: {
        ...this._state.point,
        destination: foundDestination.id
      }
    });
  };

  offerChangeHandler = (evt) => {

    const offerId =
      evt.target.id.replace('offer-', '');

    if (evt.target.checked) {

      this._state.point.offers.push(offerId);

    } else {

      this._state.point.offers =
        this._state.point.offers.filter(
          (id) => id !== offerId
        );
    }
  };

  getDestinationTemplate() {

    const hasDescription =
      this._state.destination.description;

    const hasPictures =
      this._state.destination.pictures.length > 0;

    if (!hasDescription && !hasPictures) {
      return '';
    }

    return `
      <section class="event__section event__section--destination">
        <h3 class="event__section-title event__section-title--destination">
          Destination
        </h3>

        <p class="event__destination-description">
          ${this._state.destination.description}
        </p>

        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${this.getPicturesTemplate()}
          </div>
        </div>
      </section>
    `;
  }

  get template() {

    const resetButtonText = this._isNewPoint
      ? 'Cancel'
      : 'Delete';

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">

          <header class="event__header">

            <div class="event__type-wrapper">

              <label
                class="event__type event__type-btn"
                for="event-type-toggle-1"
              >
                <span class="visually-hidden">
                  Choose event type
                </span>

                <img
                  class="event__type-icon"
                  width="17"
                  height="17"
                  src="img/icons/${this._state.point.type}.png"
                >
              </label>

              <input
                id="event-type-toggle-1"
                class="event__type-toggle visually-hidden"
                type="checkbox"
              >

              <div class="event__type-list">

                <fieldset class="event__type-group">

                  <legend class="visually-hidden">
                    Event type
                  </legend>

                  ${this.getEventTypesTemplate()}

                </fieldset>

              </div>

            </div>

            <div class="event__field-group event__field-group--destination">
              <label class="event__label event__type-output">
                ${this._state.point.type}
              </label>

              <input
                class="event__input event__input--destination"
                type="text"
                list="destination-list"
                value="${this._state.destination.name}"
              >

              <datalist id="destination-list">
                ${this._allDestinations.map((destination) => `
                  <option value="${destination.name}"></option>
                `).join('')}
              </datalist>
            </div>

            <div class="event__field-group event__field-group--time">

              <input
                class="event__input event__input--time-start"
                type="text"
                value="${formatDateTime(this._state.point.dateFrom)}"
              >

              &mdash;

              <input
                class="event__input event__input--time-end"
                type="text"
                value="${formatDateTime(this._state.point.dateTo)}"
              >

            </div>

            <div class="event__field-group event__field-group--price">

              <label class="event__label">
                &euro;
              </label>

              <input
                class="event__input event__input--price"
                type="text"
                maxlength="9"
                value="${this._state.point.basePrice}"
              >

            </div>

            <button
              class="event__save-btn btn btn--blue"
              type="submit"
              ${this._state.isDisabled ? 'disabled' : ''}
            >
              ${this._state.isSaving ? 'Saving...' : 'Save'}
            </button>

            <button
              class="event__reset-btn"
              type="reset"
              ${this._state.isDisabled ? 'disabled' : ''}
            >
              ${resetButtonText}
            </button>

            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>

          </header>

          <section class="event__details">

            <section class="event__section event__section--offers">
              <h3 class="event__section-title event__section-title--offers">
                Offers
              </h3>

              <div class="event__available-offers">
                ${this.getOffersTemplate()}
              </div>
            </section>

            ${this.getDestinationTemplate()}

          </section>

        </form>
      </li>
    `;
  }

  _restoreHandlers() {
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setRollupClickHandler(this._callback.rollupClick);
    this.setDeleteClickHandler(this._callback.deleteClick);
    this.setDestinationChangeHandler();
    this.setTypeChangeHandler();
    this.setOffersChangeHandler();
    this.setPriceInputHandler();
    this.setDatepicker();
  }
}
