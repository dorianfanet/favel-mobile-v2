import {
  NavigationState,
  useTripNavigation,
} from "@/context/tripNavigationContext";

export function useTripNavigationActions() {
  const { state, dispatch } = useTripNavigation();

  const push = (newState: Partial<NavigationState>) =>
    dispatch({ type: "PUSH", payload: newState });
  const pop = () => dispatch({ type: "POP" });
  const next = () => dispatch({ type: "NEXT" });

  return {
    push,
    pop,
    next,
    canPop: state.currentIndex > 0,
    canNext: state.currentIndex < state.stack.length - 1,
    currentState: state.stack[state.currentIndex],
  };
}
