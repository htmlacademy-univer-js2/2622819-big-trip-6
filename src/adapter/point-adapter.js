export default class PointAdapter {

  static adaptToClient(point) {

    return {
      id: point.id,
      type: point.type,
      destination: point.destination,

      dateFrom: point.date_from,
      dateTo: point.date_to,

      basePrice: point.base_price,

      isFavorite: point.is_favorite,

      offers: point.offers
    };
  }

  static adaptToServer(point) {

    const serverPoint = {
      id: point.id,

      type: point.type,
      destination: point.destination,

      'date_from': point.dateFrom,
      'date_to': point.dateTo,

      'base_price': point.basePrice,

      'is_favorite': point.isFavorite,

      offers: point.offers
    };

    return serverPoint;
  }
}
