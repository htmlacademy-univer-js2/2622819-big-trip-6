import {render} from '../render.js';

import FilterView from '../view/filter-view.js';

export default class FilterPresenter {

  constructor(
    container,
    pointsModel,
    filterModel,
    onFilterChange
  ) {

    this.container = container;

    this.pointsModel = pointsModel;

    this.filterModel = filterModel;

    this.onFilterChange = onFilterChange;
  }

  init() {

    const points = this.pointsModel.getPoints();

    const now = new Date();

    const filters = [
      {
        type: 'everything',
        name: 'Everything',
        checked: true,
        disabled: false
      },
      {
        type: 'future',
        name: 'Future',
        checked: false,
        disabled: !points.some(
          (point) => new Date(point.dateFrom) > now
        )
      },
      {
        type: 'present',
        name: 'Present',
        checked: false,
        disabled: !points.some(
          (point) =>
            new Date(point.dateFrom) <= now
            && new Date(point.dateTo) >= now
        )
      },
      {
        type: 'past',
        name: 'Past',
        checked: false,
        disabled: !points.some(
          (point) => new Date(point.dateTo) < now
        )
      }
    ];

    const filterComponent = new FilterView(
      filters,
      this.handleFilterTypeChange
    );

    render(filterComponent, this.container);
  }

  handleFilterTypeChange = (filterType) => {

    this.filterModel.setFilter(filterType);

    this.onFilterChange();
  };
}
