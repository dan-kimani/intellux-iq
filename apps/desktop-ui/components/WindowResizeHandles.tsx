import { View } from "nsh";

/**
 * Frameless-window resize edges and corners. They reach the window's edge so
 * a press there lands on the handle, and carry the pointer each edge shows;
 * a transparent view gives no other hint that it can be dragged.
 */
export function WindowResizeHandles() {
  return (
    <>
      <View
        testID="window-resize-top"
        class="absolute inset-x-0 top-0 h-2 cursor-ns-resize"
        desktop={{ windowResize: "top" }}
      />
      <View
        testID="window-resize-bottom"
        class="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
        desktop={{ windowResize: "bottom" }}
      />
      <View
        testID="window-resize-left"
        class="absolute inset-y-0 left-0 w-2 cursor-ew-resize"
        desktop={{ windowResize: "left" }}
      />
      <View
        testID="window-resize-right"
        class="absolute inset-y-0 right-0 w-2 cursor-ew-resize"
        desktop={{ windowResize: "right" }}
      />
      <View
        testID="window-resize-top-left"
        class="absolute left-0 top-0 size-4 cursor-nwse-resize"
        desktop={{ windowResize: "topLeft" }}
      />
      <View
        testID="window-resize-top-right"
        class="absolute right-0 top-0 size-4 cursor-nesw-resize"
        desktop={{ windowResize: "topRight" }}
      />
      <View
        testID="window-resize-bottom-left"
        class="absolute bottom-0 left-0 size-4 cursor-nesw-resize"
        desktop={{ windowResize: "bottomLeft" }}
      />
      <View
        testID="window-resize-bottom-right"
        class="absolute bottom-0 right-0 size-4 cursor-nwse-resize"
        desktop={{ windowResize: "bottomRight" }}
      />
    </>
  );
}
