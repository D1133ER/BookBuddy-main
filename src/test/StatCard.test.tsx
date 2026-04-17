import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "@/components/dashboard/StatCard";
import { BookOpen } from "lucide-react";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("StatCard", () => {
  it("renders title and numeric value", () => {
    render(
      <StatCard
        title="My Listed Books"
        value={12}
        icon={<BookOpen data-testid="icon" />}
      />,
    );
    expect(screen.getByText("My Listed Books")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders string value", () => {
    render(
      <StatCard
        title="Approval Rate"
        value="87%"
        icon={<BookOpen />}
      />,
    );
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <StatCard
        title="Title"
        value={0}
        icon={<BookOpen />}
        description="Some helpful description"
      />,
    );
    expect(screen.getByText("Some helpful description")).toBeInTheDocument();
  });

  it("renders positive trend", () => {
    render(
      <StatCard
        title="Title"
        value={5}
        icon={<BookOpen />}
        trend={{ value: 10, isPositive: true }}
      />,
    );
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });

  it("does not render trend section when trend is not provided", () => {
    const { container } = render(
      <StatCard title="Title" value={5} icon={<BookOpen />} />,
    );
    // trend section contains percentage text – must not appear
    expect(container.querySelector(".text-green-500")).toBeNull();
  });
});
