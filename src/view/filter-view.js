import AbstractView from '../framework/view/abstract-view.js';

export default class FilterView extends AbstractView {

  constructor(filters, onFilterTypeChange) {
    super();

    this.filters = filters;

    this._callback = {
      onFilterTypeChange
    };

    this.element.addEventListener(
      'change',
      this.filterTypeChangeHandler
    );
  }

  filterTypeChangeHandler = (evt) => {
    evt.preventDefault();

    this._callback.onFilterTypeChange(evt.target.value);
  };

  createFilterTemplate = (filter) => `
    <div class="trip-filters__filter">
      <input
        id="filter-${filter.type}"
        class="trip-filters__filter-input visually-hidden"
        type="radio"
        name="trip-filter"
        value="${filter.type}"
        ${filter.checked ? 'checked' : ''}
        ${filter.disabled ? 'disabled' : ''}
      >
      <label
        class="trip-filters__filter-label"
        for="filter-${filter.type}"
      >
        ${filter.name}
      </label>
    </div>
  `;

  get template() {
    return `
      <form class="trip-filters" action="#" method="get">
        ${this.filters.map(this.createFilterTemplate).join('')}
        <button class="visually-hidden" type="submit">
          Accept filter
        </button>
      </form>
    `;
  }
}
