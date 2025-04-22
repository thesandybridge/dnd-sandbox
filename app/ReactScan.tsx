"use client";
// react-scan must be imported before react
import { scan } from "react-scan";
import { JSX, useEffect } from "react";

interface Props {
  enabled?: boolean
}
export function ReactScan({ enabled = false }: Props): JSX.Element {
  useEffect(() => {
    scan({
      enabled,
    });
  }, [enabled]);

  return <></>;
}
