# WebGL 3D Object Viewer

## Overview

This project is a **WebGL-based 3D Object Viewer** designed to load and render 3D models in `.obj` format. It provides features like texture mapping, lighting effects, and object auto-rotation.

---

## Features

- **OBJ File Loading**: Import and render `.obj` 3D models.
- **Texture Support**: Apply textures, including non-power-of-2 image dimensions.
- **Lighting**: Dynamic lighting with ambient, diffuse, and specular components.
- **Interactive Controls**:
  - Toggle lighting and textures.
  - Adjust lighting intensity and auto-rotation speed.
  - Pan, zoom, and rotate the object.
- **Bounding Box Visualization**: Display the object's bounding box.

---

## File Structure

### Key Files:
1. **`project2.html`**:
   - The main HTML file that initializes the WebGL canvas and UI.
   - Includes interactive controls for loading models, textures, and toggling lighting.

2. **`project2.js`**:
   - Implements the core WebGL rendering logic.
   - Key functionalities:
     - Loading and rendering 3D models.
     - Texture mapping with support for non-power-of-2 dimensions.
     - Lighting effects using shaders.

3. **`obj.js`**:
   - Defines the `ObjMesh` class for parsing `.obj` files.
   - Prepares vertex, texture, and normal buffers for rendering.

4. **Shading Logic**:
   - Vertex Shader (`meshVS` in `project2.js`): Handles object transformations and passes data to the fragment shader.
   - Fragment Shader (`meshFS` in `project2.js`): Calculates lighting and texture effects.

---

## Added Features

This section highlights the enhancements made in project2.js file with given tasks:

1. **Non-Power-of-2 Textures**:
   - **Task 1**: Implements handling for non-power-of-2 textures using `CLAMP_TO_EDGE` wrapping and `LINEAR` filtering.

2. **Lighting Implementation**:
   - **Task 2-3**: Implements lighting using the Phong reflection model, including ambient, diffuse, and specular components.

## GitHub Repository

You can find the source code and project files on GitHub:  
[GitHub Repository Link](https://github.com/yourusername/webgl-3d-object-viewer)   



