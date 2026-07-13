"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (reset: () => void) => ReactNode;
}
interface State {
  error: Error | null;
}

// 클라이언트 런타임 에러를 잡아 앱 전체 크래시를 방지
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.reset);
      return (
        <div className="card p-6 text-center space-y-3" role="alert">
          <p className="text-lg">😵 앗, 문제가 생겼어요</p>
          <p className="text-sm text-bark-soft">{this.state.error.message}</p>
          <button
            type="button"
            onClick={this.reset}
            className="px-4 py-2 rounded-lg bg-onsen text-white text-sm font-medium"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
