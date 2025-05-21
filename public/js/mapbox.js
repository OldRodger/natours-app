"use strict";
import mapboxgl from "mapbox-gl";

export function displayMap(locations) {
  mapboxgl.accessToken = "pk.eyJ1IjoiZGFyZWFsY2VlIiwiYSI6ImNtMm95NmswdjBhaXEyanNpYnFneWk4NnEifQ.vGe-DUrTegrcKTX58H4CnQ";

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    const el = document.createElement("div");
    el.setAttribute("class", "marker");

    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({ offset: 30 }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100,
    },
  });
}
