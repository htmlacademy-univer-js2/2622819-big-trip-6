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

      mainPresenter.eventsContainer.insertAdjacentHTML(
        'beforeend',
        `
          <p class="trip-events__msg">
            There are no ${filterModel.getFilter()} events now
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

pointsModel.init().then(() => {

  document
    .querySelector('.trip-events__msg')
    ?.remove();

  filterPresenter.init();

  mainPresenter.init();
});

document
  .querySelector('.trip-main__event-add-btn')
  .addEventListener('click', () => {

    newPointPresenter.init();
  });
