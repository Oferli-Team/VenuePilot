import { act, renderHook } from "@testing-library/react";
import { useIsMobile } from "@/lib/hooks/ismobile";

describe("useIsMobile", () => {
  const resizeWindow = (width: number) => {
    act(() => {
      window.innerWidth = width;
      window.dispatchEvent(new Event("resize"));
    });
  };

  it("should return true if the window width is less than 640px", () => {
    const { result } = renderHook(() => useIsMobile());

    resizeWindow(600); // mobile

    expect(result.current).toBe(true);
  });

  it("should return false if the window width is 640px or more", () => {
    const { result } = renderHook(() => useIsMobile());

    resizeWindow(800);

    expect(result.current).toBe(false);
  });
});
