import {UserAction} from '../const.js';

import SortView from '../view/sort-view.js';
import NoPointsView from '../view/no-points-view.js';
import TripInfoView from '../view/trip-info-view.js';

import PointPresenter from './point-presenter.js';
import {formatDate} from '../utils/format.js';
import {render, RenderPosition} from '../render.js';

export default class MainPresenter {

  constructor(pointsModel, filterModel) {

    this.pointsModel = pointsModel;
    this.filterModel = filterModel;

    this.tripInfoComponent = null;

    this.pointPresenters = new Map();

    this.currentSortType = 'day';

    this.handleViewAction = this.handleViewAction.bind(this);
  }

  init() {
    this.filterContainer = document.querySelector('.trip-controls__filters');
    this.eventsContainer = document.querySelector('.trip-events');
    this.eventsListContainer = document.querySelector('.trip-events__list');

    this.points = this.pointsModel.getPoints();
    this.destinations = this.pointsModel.getDestinations();
    this.offers = this.pointsModel.getOffers();

    this.renderTripInfo();

    render(
      new SortView(this.handleSortTypeChange),
      this.eventsContainer,
      RenderPosition.AFTERBEGIN
    );

    if (this.filteredPoints.length === 0) {

      render(
        new NoPointsView(this.filterModel.getFilter()),
        this.eventsContainer
      );

      return;
    }

    this.renderPoints(this.filteredPoints);
  }

  renderTripInfo() {

    const routeNames = this.points
      .map((point) =>
        this.destinations.find(
          (destination) => destination.id === point.destination
        )?.name
      )
      .filter(Boolean);

    let routeTitle = '';

    if (routeNames.length <= 3) {
      routeTitle = routeNames.join(' — ');
    } else {
      routeTitle =
        `${routeNames[0]} — ... — ${routeNames.at(-1)}`;
    }

    const sortedPoints = [...this.points]
      .sort(
        (a, b) => new Date(a.dateFrom) - new Date(b.dateFrom)
      );

    const firstDate = sortedPoints[0]?.dateFrom;
    const lastDate = sortedPoints.at(-1)?.dateTo;

    const tripDates =
      `${formatDate(firstDate)} — ${formatDate(lastDate)}`;

    const totalPrice = this.points.reduce((sum, point) => {

      let pointPrice = point.basePrice;

      const offersByType = this.offers.find(
        (offer) => offer.type === point.type
      );

      if (offersByType) {

        point.offers.forEach((offerId) => {

          const selectedOffer = offersByType.offers.find(
            (offer) => offer.id === offerId
          );

          if (selectedOffer) {
            pointPrice += selectedOffer.price;
          }
        });
      }

      return sum + pointPrice;
    }, 0);

    const tripMainElement =
      document.querySelector('.trip-main');

    if (this.tripInfoComponent) {
      this.tripInfoComponent.element.remove();
      this.tripInfoComponent.removeElement();
    }

    this.tripInfoComponent = new TripInfoView(
      routeTitle,
      tripDates,
      totalPrice
    );

    render(
      this.tripInfoComponent,
      tripMainElement,
      RenderPosition.AFTERBEGIN
    );
  }

  get filteredPoints() {

    const filterType = this.filterModel.getFilter();

    switch (filterType) {

      case 'future':
        return this.points.filter(
          (point) => new Date(point.dateFrom) > new Date()
        );

      case 'present':
        return this.points.filter(
          (point) =>
            new Date(point.dateFrom) <= new Date()
            && new Date(point.dateTo) >= new Date()
        );

      case 'past':
        return this.points.filter(
          (point) => new Date(point.dateTo) < new Date()
        );

      default:
        return this.points;
    }
  }

  renderPoints(points) {

    points.forEach((point) => {
      const destination = this.destinations.find((d) => d.id === point.destination);

      const pointPresenter = new PointPresenter(
        this.eventsListContainer,
        point,
        destination,
        this.offers,
        this.destinations,
        this.handleModeChange,
        this.handleViewAction
      );

      pointPresenter.init();

      this.pointPresenters.set(point.id, pointPresenter);
    });
  }

  handleModeChange = () => {
    this.pointPresenters.forEach((presenter) => presenter.resetView());
  };

  clearPointList() {
    this.pointPresenters.forEach((presenter) => presenter.destroy());

    this.pointPresenters.clear();
  }

  handleSortTypeChange = (sortType) => {

    if (this.currentSortType === sortType) {
      return;
    }

    this.currentSortType = sortType;

    this.clearPointList();

    const sortedPoints = [...this.filteredPoints];

    switch (sortType) {
      case 'time':
        sortedPoints.sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);

          return durationB - durationA;
        });
        break;

      case 'price':
        sortedPoints.sort((a, b) => b.basePrice - a.basePrice);
        break;

      default:
        sortedPoints.sort((a, b) =>
          new Date(a.dateFrom) - new Date(b.dateFrom)
        );
    }

    this.renderPoints(sortedPoints);
  };

  handleViewAction(actionType, update) {

    switch (actionType) {

      case UserAction.UPDATE_POINT:

        this.pointsModel.updatePoint(update)
          .then(() => {

            this.points = this.pointsModel.getPoints();

            this.renderTripInfo();

            this.clearPointList();

            this.renderPoints(this.filteredPoints);
          })
          .catch(() => {

            this.pointPresenters
              .get(update.id)
              ?.setAborting();
          });

        break;

      case UserAction.DELETE_POINT:

        this.pointsModel.deletePoint(update)
          .then(() => {

            this.points = this.pointsModel.getPoints();

            this.renderTripInfo();

            this.clearPointList();

            this.renderPoints(this.filteredPoints);
          })
          .catch(() => {

            this.pointPresenters
              .get(update.id)
              ?.setAborting();
          });

        break;
    }
  }
}
