import React from "react";
import calculateFee from "../utils/calculateFee";
import fetchVenue from "../api/fetchVenue";
import { FormProps } from "./types";
import "./Form.css"
import { useState } from "react";
import building from "../assets/building.svg"
import cart from "../assets/cart.svg"
import pin from "../assets/map-pin.svg"

function Form({
    venueSlug,
    setVenueSlug,
    cartValue,
    setCartValue,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    updateFeesState, // function
    }: FormProps) {

    const [cartValueError, setCartValueError] = useState<string | null>(null);
    const [inputCartValue, setInputCartValue] = useState<string>(""); // 入力中の値

    const [venueSlugError, setVenueSlugError] = useState<string | null>(null);
    const [getLocationError, setGetLocationError] = useState<string | null>(null);

    const handleVenueSlug = (value: string) => {
        if (value === "") {
            setVenueSlugError(null);
            setVenueSlug("");
            return;
        }
        setVenueSlug(value);
        setVenueSlugError("");
    }

    const handleCartValue = (value: string) => {
        setInputCartValue(value);

        if (value === "") {
            setCartValueError(null);
            setCartValue(null);
            return;
        }
        // 正規表現で数値形式を検証（小数点を許可）
        const validNumberRegex = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;
        if (!validNumberRegex.test(value)) {
            setCartValueError("Cart value must be a valid number.");
            setCartValue(null);
            return;
        }

        const numericValue = parseFloat(value);
        if (numericValue <= 0) {
            setCartValueError("Cart value must be greater than 0.");
            setCartValue(null);
        } else {
            setCartValueError(null);
            setCartValue(numericValue);
        }
    };

    const [latitudeError, setLatitudeError] = useState<string | null>(null);
    const [longitudeError, setLongitudeError] = useState<string | null>(null);

    // why string, not number? 
    const handleLatitude = (value: string) => {
        if (value === "") {
            setLatitudeError(null);
            setLatitude(null);
            return;
        }

        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            setLatitudeError("Latitude must be a number.");
            setLatitude(null);
            return;
        }

        if (numericValue < -90 || numericValue > 90) {
            setLatitudeError("Latitude must be between -90 and 90.");
            //setLatitude(null);  ????
            //return ;
        } else {
            setLatitudeError(null);
            //setLatitude(null);  ????
            //return ;
        }
        setLatitude(numericValue);
    };

    const handleLongitude = (value: string) => {
        if (value === "") {
            setLongitudeError(null);
            setLongitude(null);
            return;
        }

        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            setLongitudeError("Longitude must be a number.");
            setLongitude(null);
            return;
        }

        if (numericValue < -180 || numericValue > 180) {
            setLongitudeError("Longitude must be between -180 and 180.");
        } else {
            setLongitudeError(null);
        }
        setLongitude(numericValue);
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGetLocationError(null);
                    setLatitudeError(null);
                    setLongitudeError(null);
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            setGetLocationError("Location access was denied.\nPlease allow location access in your browser settings.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            setGetLocationError("Could not determine your location.\nPlease check your network or try again later.");
                            break;
                        case error.TIMEOUT:
                            setGetLocationError("Location request timed out.\nPlease try again.");
                            break;
                        default:
                            setGetLocationError("An unknown error occurred.");
                            break;
                    }
                    console.error("Error fetching location: ", error); // do I need it?
                }
            );
        } else {
            setGetLocationError("Geolocation is not supported by this browser.");
            console.error("Geolocation is not supported by this browser.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let hasError = false;

        if (!venueSlug) {
            setVenueSlugError("Venue slug is required.");
            hasError = true;
        }

        if (parseFloat(inputCartValue) <= 0) {
            setCartValueError("Cart value must be greater than 0."); // might not needed
            hasError = true;
        }
        else if (cartValue === null) {
            hasError = true;
            setCartValueError("Cart value cannot be empty.");
        }

        if (latitude === null) {
            setLatitudeError("Latitude cannot be empty.");
            hasError = true;
        }

        if (longitude === null) {
            setLongitudeError("Longitude cannot be empty.");
            hasError = true;
        }

        if (hasError){
            return ;
        }

        const venueData = await fetchVenue(venueSlug);
        if (!venueData) {
            setVenueSlugError("Please check the venue slug.");
            return;
        }

        setVenueSlugError(null);

        const result = calculateFee({
            cartValue: cartValue,
            userLatitude: latitude,
            userLongitude: longitude,
            venueLatitude: venueData.latitude,
            venueLongitude: venueData.longitude,
            orderMinimum: venueData.orderMinimum,
            basePrice: venueData.basePrice,
            distanceRanges: venueData.distanceRanges
        });

        updateFeesState(result);
    };
    
    return (
        <div className="form-container">
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <div className="label-container">
                        <label htmlFor="venueSlug">Venue Slug</label>
                        <img className="icon" src={building} alt="cart-icon" />
                    </div>
                    <input
                        type="text"
                        value={venueSlug}
                        onChange={(e) => handleVenueSlug(e.target.value)}
                        id="venueSlug"
                        data-test-id="venueSlug"
                        placeholder="home-assignment-venue-example"
                    />
                    {venueSlugError && <p className="error-message" role="alert">{venueSlugError}</p> }
                </div>
                <div className="form-group">
                    <div className="label-container">
                        <label htmlFor="CartValue">Cart Value (€)</label>
                        <img className="icon" src={cart} alt="cart-icon" />
                    </div>
                    <input
                        type="text"
                        value={inputCartValue}
                        onChange={(e) => handleCartValue(e.target.value)} // 入力変更時の処理
                        id="CartValue"
                        data-test-id="cartValue"
                        placeholder="0.00"
                    />
                    {cartValueError && <p className="error-message" role="alert">{cartValueError}</p> }
                </div>
                <div className="form-group">
                    <div className="label-container">
                        <label htmlFor="latitude">Latitude</label>
                        <img className="icon" src={pin} alt="cart-icon" />
                    </div>
                    <input
                        type="number"
                        value={latitude || ""}
                        onChange={(e) => handleLatitude(e.target.value)}
                        id="latitude"
                        data-test-id="userLatitude"
                        placeholder="60.1807791"
                    />
                    {latitudeError && <p className="error-message" role="alert">{latitudeError}</p>}
                </div>
                <div className="form-group">
                    <div className="label-container">
                        <label htmlFor="longitude">Longitude</label>
                        <img className="icon" src={pin} alt="cart-icon" />
                    </div>
                    <input
                        type="number"
                        value={longitude || ""}
                        onChange={(e) => handleLongitude(e.target.value)}
                        id="longitude"
                        data-test-id="userLongitude"
                        placeholder="24.9587424"
                    />
                    {longitudeError && <p className="error-message" role="alert">{longitudeError}</p> }
                </div>
                <button className="location-button" type="button" data-test-id="getLocation" onClick={handleGetLocation}>
                    Get Location
                </button>
                {getLocationError && (
                    <p className="error-message" role="alert">{getLocationError}</p>
                )}
                <button className="submit-button" type="submit">Calculate Delivery Price</button>
            </form>
        </div>
    );
}

export default Form;
