import AbstractView from '../framework/view/abstract-view.js';

export default class TripInfoView extends AbstractView {

  constructor(route, dates, price) {
    super();

    this.route = route;
    this.dates = dates;
    this.price = price;
  }

  get template() {
    return `
      <section class="trip-main__trip-info trip-info">

        <div class="trip-info__main">
          <h1 class="trip-info__title">
            ${this.route}
          </h1>

          <p class="trip-info__dates">
            ${this.dates}
          </p>
        </div>

        <p class="trip-info__cost">
          Total: €&nbsp;
          <span class="trip-info__cost-value">
            ${this.price}
          </span>
        </p>

      </section>
    `;
  }
}
