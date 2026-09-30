import React from "react";
import { YasproEmblem, type YasproEmblemProps } from "./YasproEmblem";

export type IyasProIconProps = YasproEmblemProps;

/**
 * YASPRO Brand Cinema Lens Emblem.
 * Backwards-compatible export mapping to the new geometric cinema aperture emblem.
 * Replaces all legacy candle flame icons with the clean YASPRO emblem.
 */
export function IyasProIcon(props: IyasProIconProps) {
  return <YasproEmblem {...props} />;
}

export { YasproEmblem };
