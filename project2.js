/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
	
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
		this.enableLightLoc = gl.getUniformLocation(this.prog, 'enableLighting');
		this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
		this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
		this.specularIntensityLoc = gl.getUniformLocation(this.prog, 'specularIntensity');
		this.viewDirLoc = gl.getUniformLocation(this.prog, 'viewDir');
	
		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
		this.normalLoc = gl.getAttribLocation(this.prog, 'normal');
	
		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();
		this.normbuffer = gl.createBuffer();
	
		this.numTriangles = 0;
	
		// Initialize default light and specular properties
		this.lightPos = [1.0, 1.0, 1.0];
		this.ambientIntensity = 0.5;
		this.specularIntensity = 0.5;
		this.viewDir = [0.0, 0.0, 1.0]; // Default camera direction
	}

	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);
	
		this.numTriangles = vertPos.length / 3;
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);
	
		gl.uniformMatrix4fv(this.mvpLoc, false, trans);
		gl.uniform1i(this.enableLightLoc, true);
		gl.uniform1f(this.ambientLoc, this.ambientIntensity);
		gl.uniform1f(this.specularIntensityLoc, this.specularIntensity);
		gl.uniform3fv(this.lightPosLoc, this.lightPos);
		gl.uniform3fv(this.viewDirLoc, this.viewDir);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.enableVertexAttribArray(this.normalLoc);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
	
		updateLightPos();
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
	
		// Upload the image into the texture
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img
		);
	
		// Check if the image dimensions are power of 2
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D); // Use mipmapping for power-of-2 textures
		} else {
			// Handle non-power-of-2 textures
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
	
		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		const sampler = gl.getUniformLocation(this.prog, 'tex');
		gl.uniform1i(sampler, 0);
	}

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	enableLighting(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.enableLightLoc, show);
	}
	
	setAmbientLight(ambient) {
		gl.useProgram(this.prog);
		this.ambientIntensity = ambient;
		gl.uniform1f(this.ambientLoc, ambient);
	}
	setSpecularLight(specular) {
		gl.useProgram(this.prog);
		this.specularIntensity = specular;
		gl.uniform1f(this.specularIntensityLoc, specular); // Pass to the shader
	}
	
}

function SetSpecularLight(param) {
    meshDrawer.setSpecularLight(param.value / 100); // Convert slider value to range [0, 1]
    DrawScene(); // Redraw the scene with the updated specular light intensity
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader source code
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 

			void main()
			{
				v_texCoord = texCoord;
				v_normal = normal;

				gl_Position = mvp * vec4(pos,1);
			}`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
    precision mediump float;

    uniform bool showTex;               // Flag to show texture
    uniform bool enableLighting;        // Flag to enable lighting
    uniform sampler2D tex;              // Texture sampler
    uniform vec3 lightPos;              // Light position
    uniform float ambient;              // Ambient light intensity
    uniform float specularIntensity;    // Specular light intensity
    uniform vec3 viewDir;               // View direction for specular reflection

    varying vec2 v_texCoord;            // Texture coordinates from vertex shader
    varying vec3 v_normal;              // Normal vector from vertex shader

    void main() {
        vec4 baseColor;

        if (showTex) {
            // Use the texture color if enabled
            baseColor = texture2D(tex, v_texCoord);
        } else {
            // Default to white if texture is not enabled
            baseColor = vec4(1.0, 1.0, 1.0, 1.0);
        }

        if (enableLighting) {
            // Normalize the normal and light direction vectors
            vec3 norm = normalize(v_normal);
            vec3 lightDir = normalize(lightPos);

            // Ambient lighting calculation
            vec3 ambientLight = ambient * vec3(1.0, 1.0, 1.0);

            // Diffuse lighting calculation
            float diff = max(dot(norm, lightDir), 0.0);
            vec3 diffuseLight = diff * vec3(1.0, 1.0, 1.0);

            // Specular lighting calculation (Phong reflection model)
            vec3 reflectDir = reflect(-lightDir, norm); // Reflection direction
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); // Shininess factor
            vec3 specularLight = specularIntensity * spec * vec3(1.0, 1.0, 1.0);

            // Combine ambient, diffuse, and specular lighting
            vec3 finalColor = ambientLight + diffuseLight + specularLight;

            // Multiply the base color with lighting
            gl_FragColor = baseColor * vec4(finalColor, 1.0);
        } else {
            // If lighting is disabled, use only the base color
            gl_FragColor = baseColor;
        }
    }
`;
			

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;

const keys = {};
function updateLightPos() {
	const translationSpeed = 1;
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;
}
///////////////////////////////////////////////////////////////////////////////////