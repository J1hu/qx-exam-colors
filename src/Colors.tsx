import React, { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Stack, ListGroup } from "react-bootstrap";

// Define the types for the details object
interface Details {
  name: string;
  hex: string;
  code: string;
}

interface ColorData {
  name: string;
  hex_code: string;
  color_code: string;
}

// Parent Component
function Colors() {
  const [colors, setColors] = useState<ColorData[]>([]);
  const [details, setDetails] = useState<Details>({
    name: "",
    hex: "",
    code: "",
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Fetch data from the API
      try {
        const response = await fetch(
          "https://api.prolook.com/api/colors/prolook"
        );

        // Throw error response
        if (!response.ok) {
          throw new Error(`HTTP error! Status ${response.status}`);
        }

        const responseData = await response.json();

        const colors: ColorData[] = responseData.colors;

        setColors(colors);
      } catch (error) {
        console.log("Error:", error);
      }
    }

    // Calling the async function
    fetchData();
  }, []);

  // HELPERS
  function getDetails(name: string, hex: string, code: string) {
    setDetails({ name, hex, code });
  }

  // Function to calculate contrast ratio
  function calculateContrastRatio(hexColor: string): number {
    const hexToRgb = (hex: string): number[] => {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return [r, g, b];
    };

    const [r, g, b] = hexToRgb(hexColor);

    // Calculate luminance using the relative luminance formula
    const luminance =
      0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);

    // Calculate contrast ratio
    const contrast = (luminance + 0.05) / 0.05;

    return contrast;
  }

  // COMPONENTS
  interface ColorListProps {
    colors: ColorData[]; // Use the ColorData interface
  }

  function ColorList({ colors }: ColorListProps) {
    // Validation, can also be used as a loading screen when fetching data
    if (!colors || colors.length === 0) {
      return <div className="center wrapper fs-4">Loading...</div>;
    }

    // Setting the visibility to true when the user selects a color
    const toggleVisibility = () => {
      setIsVisible(true);
    };

    // ColorList render
    return (
      <div className="color-list-wrapper">
        {colors.map((color: ColorData) => (
          <Stack key={color.name}>
            <ListGroup>
              <ListGroup.Item className="d-flex justify-content-between align-middle">
                <p className="fs-5">{color.name}</p>
                <Button
                  as="a"
                  variant="primary"
                  onClick={() => {
                    // Getting the details to pass to the ColorPreview component
                    getDetails(color.name, color.hex_code, color.color_code);
                    // Toggle visibility
                    toggleVisibility();
                  }}
                >
                  Preview
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Stack>
        ))}
      </div>
    );
  }

  // Preview the selected color
  interface ColorPreviewProps {
    details: Details;
    isVisible: boolean;
  }

  function ColorPreview({ details, isVisible }: ColorPreviewProps) {
    // Handle if the user has not yet selected a color
    if (!isVisible) {
      return <div className="color-preview fs-4">Please select a color</div>;
    }

    // Set text color based on the background
    const contrastRatio = calculateContrastRatio(details.hex);
    let textColor = "black";

    if (contrastRatio < 4.5) {
      textColor = "white";
    }

    // ColorPreview render
    return (
      <div
        className="color-preview"
        style={{ backgroundColor: `#${details.hex}`, color: textColor }}
      >
        <div className="fs-5 text-center">
          <p>Name: {details.name}</p>
          <p>Hex: {details.hex}</p>
          <p>Code: {details.code}</p>
        </div>
      </div>
    );
  }

  // Parent Component render
  return (
    <div className="whole-wrapper">
      <h1>Colors:</h1>
      <div className="wrapper">
        <ColorList colors={colors} />
        <ColorPreview details={details} isVisible={isVisible} />
      </div>
    </div>
  );
}

export default Colors;
