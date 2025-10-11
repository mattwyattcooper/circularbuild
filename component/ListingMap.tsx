"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import MapGL, { Layer, Marker, NavigationControl, Source } from "react-map-gl";

type ListingPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: string;
};

type Props = {
  listings: Array<{
    id: string;
    lat: number | null;
    lng: number | null;
    title: string;
    type: string;
  }>;
  radius: number;
  origin: { lat: number; lng: number } | null;
  onListingSelect?: (id: string) => void;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function makeRadiusPolygon(
  origin: { lat: number; lng: number },
  radiusMiles: number,
) {
  const earthRadiusMeters = 6378137;
  const distanceMeters = radiusMiles * 1609.34;
  const steps = 64;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i += 1) {
    const bearing = (i / steps) * 2 * Math.PI;
    const lat =
      origin.lat +
      (distanceMeters / earthRadiusMeters) *
        (180 / Math.PI) *
        Math.cos(bearing);
    const lng =
      origin.lng +
      ((distanceMeters / earthRadiusMeters) *
        (180 / Math.PI) *
        Math.sin(bearing)) /
        Math.cos((origin.lat * Math.PI) / 180);
    coords.push([lng, lat]);
  }
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Polygon" as const,
          coordinates: [coords],
        },
        properties: {},
      },
    ],
  };
}

export default function ListingMap({
  listings,
  origin,
  radius,
  onListingSelect,
}: Props) {
  const pins: ListingPin[] = listings
    .filter((l) => typeof l.lat === "number" && typeof l.lng === "number")
    .map((l) => ({
      id: l.id,
      lat: l.lat as number,
      lng: l.lng as number,
      title: l.title,
      type: l.type,
    }));

  const center = origin || pins[0] || { lat: 39.5, lng: -98.35 }; // continental US fallback

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-600">
        Mapbox token missing. Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the map
        view.
      </div>
    );
  }

  const radiusPolygon = origin ? makeRadiusPolygon(origin, radius) : null;

  return (
    <MapGL
      key={`${center.lat}-${center.lng}-${radius}`}
      initialViewState={{
        latitude: center.lat,
        longitude: center.lng,
        zoom: origin ? 9 : 6,
      }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="top-left" />
      {radiusPolygon && (
        <Source id="radius" type="geojson" data={radiusPolygon}>
          <Layer
            id="radius-fill"
            type="fill"
            paint={{
              "fill-color": "rgba(52, 211, 153, 0.33)",
              "fill-outline-color": "#34d399",
            }}
          />
          <Layer
            id="radius-outline"
            type="line"
            paint={{
              "line-width": 1.5,
              "line-color": "#10b981",
            }}
          />
        </Source>
      )}
      {origin && (
        <Marker longitude={origin.lng} latitude={origin.lat} anchor="bottom">
          <div className="rounded-full bg-emerald-600 px-2 py-1 text-xs text-white">
            You
          </div>
        </Marker>
      )}
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          longitude={pin.lng}
          latitude={pin.lat}
          anchor="bottom"
        >
          <button
            type="button"
            onClick={() => onListingSelect?.(pin.id)}
            className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {pin.type}
          </button>
        </Marker>
      ))}
    </MapGL>
  );
}
