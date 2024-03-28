import { Position } from "@turf/turf";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CameraAnimationMode, CameraBounds } from "@rnmapbox/maps";
import bbox from "@turf/bbox";

const CameraContext = createContext<CameraContext>({} as any);

export type CameraContext = {
  easing: CameraAnimationMode;
  padding: {
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
  };
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  centerOrBounds: {
    centerCoordinate?: Position;
    bounds?: CameraBounds;
  };
  move: (options: { coordinates: Coordinate[]; customZoom?: number }) => void;
  updatePadding: (
    padding:
      | {
          paddingLeft: number;
          paddingRight: number;
          paddingTop: number;
          paddingBottom: number;
        }
      | number
  ) => void;
};

type Coordinate = {
  longitude: number;
  latitude: number;
};

const initialCoordinate: Coordinate = {
  latitude: 0,
  longitude: 0,
};

const toPosition = (coordinate: Coordinate): Position => {
  return [coordinate.longitude, coordinate.latitude];
};

export const CameraProvider = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const [easing, setEasing] = useState<CameraAnimationMode>("easeTo");
  const [coordinates, setCoordinates] = useState<Coordinate[]>([
    initialCoordinate,
  ]);
  const [paddingLeft, setPaddingLeft] = useState(0);
  const [paddingRight, setPaddingRight] = useState(0);
  const [paddingTop, setPaddingTop] = useState(0);
  const [paddingBottom, setPaddingBottom] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [minZoom, setMinZoom] = useState<number | undefined>(undefined);
  const [maxZoom, setMaxZoom] = useState<number | undefined>(undefined);

  const centerOrBounds = useMemo((): {
    centerCoordinate?: Position;
    bounds?: CameraBounds;
  } => {
    if (coordinates.length === 1) {
      return {
        centerCoordinate: toPosition(coordinates[0]),
      };
    } else {
      const positions = coordinates.map(toPosition);
      const lineString = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: positions,
        },
      };
      const _bbox = bbox(lineString);
      return {
        bounds: {
          ne: [_bbox[0], _bbox[1]],
          sw: [_bbox[2], _bbox[3]],
        },
      };
    }
  }, [coordinates]);

  const move = useCallback(
    ({
      coordinates,
      customZoom,
    }: {
      coordinates: Coordinate[];
      customZoom?: number;
    }) => {
      if (customZoom) setZoom(customZoom);
      setCoordinates(coordinates);
    },
    []
  );

  const updatePadding = useCallback(
    (
      padding:
        | {
            paddingLeft: number;
            paddingRight: number;
            paddingTop: number;
            paddingBottom: number;
          }
        | number
    ) => {
      if (typeof padding === "number") {
        setPaddingLeft(padding);
        setPaddingRight(padding);
        setPaddingTop(padding);
        setPaddingBottom(padding);
      } else {
        setPaddingLeft(padding.paddingLeft);
        setPaddingRight(padding.paddingRight);
        setPaddingTop(padding.paddingTop);
        setPaddingBottom(padding.paddingBottom);
      }
    },
    []
  );

  return (
    <CameraContext.Provider
      value={{
        easing,
        padding: {
          paddingLeft,
          paddingRight,
          paddingTop,
          paddingBottom,
        },
        zoom,
        minZoom,
        maxZoom,
        centerOrBounds,
        move,
        updatePadding,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
};
