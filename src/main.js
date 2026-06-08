import MainPresenter from './presenter/main-presenter.js';
import PointsModel from './model/points-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model.js';
import NewPointPresenter from './presenter/new-point-presenter.js';
import BigTripApi from './api/big-trip-api.js';
import LoadingView from './view/loading-view.js';
import {render} from './framework/render.js';

const filterModel = new FilterModel();

const api = new BigTripApi(
  'https://24.objects.htmlacademy.pro/big-trip',
  'Basic qwerty123456'
);

const pointsModel = new PointsModel(api);

const mainPresenter = new MainPresenter(
  pointsModel,
  filterModel
);

const newPointPresenter = new NewPointPresenter(
  document.querySelector('.trip-events__list'),
  pointsModel,
  mainPresenter
);

const filterPresenter = new FilterPresenter(
  document.querySelector('.trip-controls__filters'),
  pointsModel,
  filterModel,
  () => {
    mainPresenter.currentSortType = 'day';

    mainPresenter.clearPointList();

    newPointPresenter.destroy();

    const oldMessage = mainPresenter.eventsContainer
      .querySelector('.trip-events__msg');

    if (oldMessage) {
      oldMessage.remove();
    }

    if (mainPresenter.filteredPoints.length === 0) {

      mainPresenter.eventsContainer
        .querySelector('.trip-events__list')
        ?.replaceChildren();

      const filterType = filterModel.getFilter();

      const emptyMessage = filterType === 'everything'
        ? 'Click New Event to create your first point'
        : `There are no ${filterType} events now`;

      mainPresenter.eventsContainer.insertAdjacentHTML(
        'beforeend',
        `
          <p class="trip-events__msg">
            ${emptyMessage}
          </p>
        `
      );

      return;
    }

    mainPresenter.renderPoints(mainPresenter.filteredPoints);
  }
);

render(
  new LoadingView(),
  document.querySelector('.trip-events')
);

pointsModel.init()
  .then(() => {

    document
      .querySelector('.trip-events__msg')
      ?.remove();

    filterPresenter.init();

    mainPresenter.init();
  })
  .catch(() => {

    document
      .querySelector('.trip-events__msg')
      ?.remove();

    document
      .querySelector('.trip-events')
      .insertAdjacentHTML(
        'beforeend',
        `
          <p class="trip-events__msg">
            Failed to load latest route information
          </p>
        `
      );
  });

document
  .querySelector('.trip-main__event-add-btn')
  .addEventListener('click', () => {

    const newEventButton =
      document.querySelector('.trip-main__event-add-btn');

    newEventButton.disabled = true;

    filterModel.setFilter('everything');

    const everythingFilter =
      document.querySelector('#filter-everything');

    if (everythingFilter) {
      everythingFilter.checked = true;
    }

    document.querySelector('#sort-day').checked = true;

    mainPresenter.currentSortType = 'day';

    mainPresenter.clearPointList();

    mainPresenter.renderPoints(mainPresenter.points);

    mainPresenter.handleModeChange();

    newPointPresenter.init();
  });
