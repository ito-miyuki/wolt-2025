import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Form from "../components/Form/Form";

// テスト用のプロップスを準備
const mockSetVenueSlug = vi.fn();
const mockSetCartValue = vi.fn();
const mockSetLatitude = vi.fn();
const mockSetLongitude = vi.fn();
const mockUpdateFeesState = vi.fn();

const defaultProps = {
  venueSlug: "",
  setVenueSlug: mockSetVenueSlug,
  cartValue: null,
  setCartValue: mockSetCartValue,
  latitude: null,
  setLatitude: mockSetLatitude,
  longitude: null,
  setLongitude: mockSetLongitude,
  updateFeesState: mockUpdateFeesState,
};


describe("Form Component", () => {
  it("renders all form fields and buttons", () => {
    render(<Form {...defaultProps} />);

    expect(screen.getByLabelText("Venue Slug")).toBeInTheDocument();
    expect(screen.getByLabelText("Cart Value (€)")).toBeInTheDocument();
    expect(screen.getByLabelText("Latitude")).toBeInTheDocument();
    expect(screen.getByLabelText("Longitude")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /get location/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /calculate delivery price/i })).toBeInTheDocument();
  });

  it("displays error message for invalid cart value (<= 0)", async () => {
    render(<Form {...defaultProps} />);
    const cartValueInput = screen.getByLabelText("Cart Value (€)");

    await userEvent.type(cartValueInput, "-10");
    expect(screen.getByText("Cart value must be greater than 0.")).toBeInTheDocument();
  });

  it("clears error message when cart value is corrected", async () => {
    render(<Form {...defaultProps} />);
    const cartValueInput = screen.getByLabelText("Cart Value (€)");

    await userEvent.type(cartValueInput, "-10");
    expect(screen.getByText("Cart value must be greater than 0.")).toBeInTheDocument();

    await userEvent.clear(cartValueInput);
    await userEvent.type(cartValueInput, "100");
    expect(screen.queryByText("Cart value must be greater than 0.")).not.toBeInTheDocument();

    expect(mockSetCartValue).toHaveBeenCalledWith(100);
  });

  it("displays error if Venue Slug is empty on submit", async () => {
    render(<Form {...defaultProps} />);
    const submitButton = screen.getByRole("button", { name: /calculate delivery price/i });

    await userEvent.click(submitButton);
    expect(screen.getByText("Venue slug is required.")).toBeInTheDocument();
  });

  it("displays error if latitude or longitude is empty on submit", async () => {
    render(<Form {...defaultProps} />);
    const submitButton = screen.getByRole("button", { name: /calculate delivery price/i });

    // Venue Slug と Cart Value に一応値を入れる
    await userEvent.type(screen.getByLabelText("Venue Slug"), "some-venue");
    await userEvent.type(screen.getByLabelText("Cart Value (€)"), "10");

    // button clicked but latitude, longitude are empty
    await userEvent.click(submitButton);

    expect(screen.getByText("Latitude cannot be empty.")).toBeInTheDocument();
    expect(screen.getByText("Longitude cannot be empty.")).toBeInTheDocument();
  });

  it("clears all errors when inputs are corrected", async () => {
    render(<Form {...defaultProps} />);
    const submitButton = screen.getByRole("button", { name: /calculate delivery price/i });

    await userEvent.click(submitButton);

    // Errors should be displayed
    expect(screen.getByText("Venue slug is required.")).toBeInTheDocument();
    expect(screen.getByText("Cart value cannot be empty.")).toBeInTheDocument();
    expect(screen.getByText("Latitude cannot be empty.")).toBeInTheDocument();
    expect(screen.getByText("Longitude cannot be empty.")).toBeInTheDocument();

    // Correct inputs
    await userEvent.type(screen.getByLabelText("Venue Slug"), "some-venue");
    await userEvent.type(screen.getByLabelText("Cart Value (€)"), "10");
    await userEvent.type(screen.getByLabelText("Latitude"), "60");
    await userEvent.type(screen.getByLabelText("Longitude"), "24");

    expect(screen.queryByText("Venue slug is required.")).not.toBeInTheDocument();
    expect(screen.queryByText("Cart value cannot be empty.")).not.toBeInTheDocument();
    expect(screen.queryByText("Latitude cannot be empty.")).not.toBeInTheDocument();
    expect(screen.queryByText("Longitude cannot be empty.")).not.toBeInTheDocument();
  });
});
