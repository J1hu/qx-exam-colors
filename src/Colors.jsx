import { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Stack, ListGroup } from "react-bootstrap";

// Parent Component
function Colors() {
  const [colors, setColors] = useState([]);
  const [details, setDetails] = useState({ name: "", hex: "", code: "" });
  const [isVisible, setIsVisible] = useState(false);

  // HELPERS
  function getDetails(name, hex, code) {
    setDetails({ name, hex, code });
  }

  // idea from https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors
  function calculateContrastRatio(hexColor) {
    // Function to calculate contrast ratio
    const hexToRgb = (hex) => {
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
  function ColorList({ colors }) {

    //validation, can also be used as a loading screen when fetching data
    if (!colors || !Array.isArray(colors.colors)) {
      return <div className="center wrapper fs-4">Loading...</div>;
    }

    //setting the visibility to true when user selected a color
    const toggleVisibility = () => {
      setIsVisible(true);
    };

    return (
      <div className="color-list-wrapper">
        {colors.colors.map((color) => (
          <Stack key={color.name}>
            <ListGroup>
              <ListGroup.Item className="d-flex justify-content-between align-middle">
                <p className="fs-5">{color.name}</p>
                <Button
                  as="a"
                  variant="primary"
                  onClick={() => {
                    // getting the details to pass to the ColorPreview component
                    getDetails(color.name, color.hex_code, color.color_code);
                    //toggle visibility
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
  function ColorPreview({ details, isVisible }) {

    // handle if the user has not yet selected a color
    if (!isVisible) {
      return <div className="color-preview fs-4">Please select a color</div>;
    }
    
    // set text color based on the background
    const contrastRatio = calculateContrastRatio(details.hex);
    let textColor = "black";
  
    if (contrastRatio < 4.5) {
      textColor = "white";
    }
  
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
  

  useEffect(() => {
    async function fetchData() {
      //fetch data from the api
      try {
        const response = await fetch(
          "https://api.prolook.com/api/colors/prolook"
        );
        
        // throw error response
        if (!response.ok) {
          throw new Error(`HTTP error! Status ${response.status}`);
        }

        // put the data to the state
        const data = await response.json();
        setColors(data);

      } catch (error) {
        console.log("Error:", error);
      }
    }

    // calling the async function
    fetchData();
  }, []);

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
