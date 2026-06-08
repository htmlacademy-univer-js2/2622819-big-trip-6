import {render, remove, RenderPosition} from '../framework/render.js';

import EditEventView from '../view/edit-event-view.js';

export default class NewPointPresenter {

  constructor(
    container,
    pointsModel,
    mainPresenter
  ) {

    this.container = container;

    this.pointsModel = pointsModel;

    this.mainPresenter = mainPresenter;

    this.pointComponent = null;

    this.escKeyDownHandler = this.escKeyDownHandler.bind(this);
  }

  init() {

    if (this.pointComponent !== null) {
      return;
    }

    this.destinations =
      this.pointsModel.getDestinations();

    this.offers =
      this.pointsModel.getOffers();

    const defaultDestination = this.destinations.length
      ? this.destinations[0]
      : {
        id: '',
        name: '',
        description: '',
        pictures: []
      };

    const emptyPoint = {
      point: {
        type: 'flight',
        destination: defaultDestination.id,
        dateFrom: new Date().toISOString(),
        dateTo: new Date().toISOString(),
        basePrice: 0,
        isFavorite: false,
        offers: []
      },

      destination: defaultDestination,

      offers: this.offers
    };

    this.pointComponent = new EditEventView(
      emptyPoint.point,
      emptyPoint.destination,
      emptyPoint.offers,
      this.destinations,
      true
    );

    render(
      this.pointComponent,
      this.container,
      RenderPosition.AFTERBEGIN
    );

    document.addEventListener(
      'keydown',
      this.escKeyDownHandler
    );

    this.pointComponent.setDatepicker();

    this.pointComponent.setPriceInputHandler();

    this.pointComponent.setRollupClickHandler(() => {
      this.destroy();
    });

    this.pointComponent.setDeleteClickHandler((evt) => {
      evt.preventDefault();

      this.destroy();

      document.querySelector('.trip-main__event-add-btn').disabled = false;
    });

    this.pointComponent.setFormSubmitHandler((evt) => {
      evt.preventDefault();

      this.pointComponent.updateElement({
        isDisabled: true,
        isSaving: true
      });

      this.pointsModel.addPoint(
        this.pointComponent._state.point
      )
        .then(() => {

          this.mainPresenter.points =
            this.pointsModel.getPoints();

          this.mainPresenter.clearPointList();

          this.mainPresenter.renderPoints(
            this.mainPresenter.filteredPoints
          );

          this.destroy();
        })
        .catch(() => {

          this.pointComponent.shake(() => {

            this.pointComponent.updateElement({
              isDisabled: false,
              isSaving: false
            });
          });
        });
    });
  }

  escKeyDownHandler(evt) {

    if (evt.key === 'Escape') {
      evt.preventDefault();

      this.destroy();
    }
  }

  destroy() {

    if (this.pointComponent === null) {
      return;
    }

    document.removeEventListener(
      'keydown',
      this.escKeyDownHandler
    );

    document.querySelector(
      '.trip-main__event-add-btn'
    ).disabled = false;

    remove(this.pointComponent);

    this.pointComponent = null;
  }
}
