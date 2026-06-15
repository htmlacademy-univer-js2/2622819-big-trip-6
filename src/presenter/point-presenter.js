import {render, replace, remove} from '../framework/render.js';
import {UserAction} from '../const.js';
import {Key} from '../const.js';

import EventView from '../view/event-view.js';
import EditEventView from '../view/edit-event-view.js';

export default class PointPresenter {

  constructor(container, point, destination, offers, destinations, onModeChange, onDataChange) {
    this.container = container;
    this.point = point;
    this.destination = destination;
    this.offers = offers;
    this.destinations = destinations;
    this.onModeChange = onModeChange;
    this.onDataChange = onDataChange;

    this.eventComponent = null;
    this.editComponent = null;
  }

  init() {

    const prevEventComponent = this.eventComponent;
    const prevEditComponent = this.editComponent;

    this.eventComponent = new EventView(
      this.point,
      this.destination,
      this.offers
    );

    this.editComponent = new EditEventView(
      this.point,
      this.destination,
      this.offers,
      this.destinations
    );

    this.eventComponent.setRollupClickHandler(() => {

      this.onModeChange();

      this.replaceEventToEdit();

      this.editComponent.setDatepicker();

      this.editComponent.setPriceInputHandler();

      document.addEventListener('keydown', this.escKeyDownHandler);
    });
    this.eventComponent.setFavoriteClickHandler(() => {

      const updatedPoint = {
        ...this.point,
        isFavorite: !this.point.isFavorite
      };

      this.onDataChange(
        UserAction.UPDATE_POINT,
        updatedPoint
      );
    });

    this.editComponent.setFormSubmitHandler((evt) => {
      evt.preventDefault();

      this.editComponent.updateElement({
        isDisabled: true,
        isSaving: true
      });

      this.onDataChange(
        UserAction.UPDATE_POINT,
        this.editComponent._state.point
      );
    });

    this.editComponent.setRollupClickHandler(() => {
      this.replaceEditToEvent();
    });

    this.editComponent.setDeleteClickHandler((evt) => {
      evt.preventDefault();

      this.editComponent.updateElement({
        isDisabled: true,
        isDeleting: true
      });

      this.onDataChange(
        UserAction.DELETE_POINT,
        this.point
      );
    });

    if (prevEventComponent === null || prevEditComponent === null) {
      render(this.eventComponent, this.container);
      return;
    }

    replace(this.eventComponent, prevEventComponent);

    if (document.body.contains(prevEditComponent.element)) {
      replace(this.editComponent, prevEditComponent);
    }
  }

  replaceEventToEdit() {
    replace(this.editComponent, this.eventComponent);
  }

  replaceEditToEvent() {
    replace(this.eventComponent, this.editComponent);

    document.removeEventListener('keydown', this.escKeyDownHandler);
  }

  resetView() {

    if (document.body.contains(this.editComponent.element)) {
      this.replaceEditToEvent();
    }
  }

  escKeyDownHandler = (evt) => {
    if (evt.key === Key.ESCAPE) {
      evt.preventDefault();
      this.replaceEditToEvent();

      document.removeEventListener('keydown', this.escKeyDownHandler);
    }
  };

  setAborting() {

    this.editComponent.shake(() => {

      this.editComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false
      });
    });
  }

  destroy() {
    remove(this.eventComponent);
    remove(this.editComponent);
  }
}
