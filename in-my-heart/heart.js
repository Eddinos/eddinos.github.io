function createScene () {
	const  scene = new THREE.Scene()
	const  camera = new THREE.PerspectiveCamera(60,  window.innerWidth / window.innerHeight, 1, 100)
	camera.position.z = 30
	    
	const  renderer = new THREE.WebGLRenderer({ antialias: true })
	renderer.setSize(window.innerWidth, window.innerHeight)
	document.body.appendChild(renderer.domElement)
	    
	const color = 0xFFFFFF
	const intensity = 0.75
	const light = new THREE.PointLight(color, intensity)
	light.position.set(-15, -10, 30)

	scene.add(light)
		
	return {
		scene,
		camera,
		renderer
	}
}

function useCoordinates () {
  const vertices = [
    new THREE.Vector3(0, 0, 0), // point C
    new THREE.Vector3(0, 5, -1.5),
    new THREE.Vector3(5, 5, 0), // point A
    new THREE.Vector3(9, 9, 0),
    new THREE.Vector3(5, 9, 2),
    new THREE.Vector3(7, 13, 0),
    new THREE.Vector3(3, 13, 0),
    new THREE.Vector3(0, 11, 0),
    new THREE.Vector3(5, 9, -2),
    new THREE.Vector3(0, 8, -3),
    new THREE.Vector3(0, 8, 3),
    new THREE.Vector3(0, 5, 1.5), // point B
    new THREE.Vector3(-9, 9, 0),
    new THREE.Vector3(-5, 5, 0),
    new THREE.Vector3(-5, 9, -2),
    new THREE.Vector3(-5, 9, 2),
    new THREE.Vector3(-7, 13, 0),
    new THREE.Vector3(-3, 13, 0),
  ];
  const trianglesIndexes = [
  // face 1
    2,11,0, // This represents the 3 points A,B,C which compose the first triangle
    2,3,4,
    5,4,3,
    4,5,6,
    4,6,7,
    4,7,10,
    4,10,11,
    4,11,2,
    0,11,13,
    12,13,15,
    12,15,16,
    16,15,17,
    17,15,7,
    7,15,10,
    11,10,15,
    13,11,15,
  // face 2
    0,1,2,
    1,9,2,
    9,8,2,
    5,3,8,
    8,3,2,
    6,5,8,
    7,6,8,
    9,7,8,
    14,17,7,
    14,7,9,
    14,9,1,
    9,1,13,
    1,0,13,
    14,1,13,
    16,14,12,
    16,17,14,
    12,14,13
  ]
  return {
    vertices,
    trianglesIndexes
  }
}

function createHeartMesh (coordinatesList, trianglesIndexes) {
	const geo = new THREE.Geometry()
	for (let i in trianglesIndexes) {
		if ((i+1)%3 === 0) {
			geo.vertices.push(coordinatesList[trianglesIndexes[i-2]], coordinatesList[trianglesIndexes[i-1]], coordinatesList[trianglesIndexes[i]])
			geo.faces.push(new THREE.Face3(i-2, i-1, i))
		}
	}
	geo.computeVertexNormals()
	const material = new THREE.MeshPhongMaterial( { color: 0xad0c00 } )
	const heartMesh = new THREE.Mesh(geo, material)
	return {
		geo,
		material,
		heartMesh
	}
}

function addWireFrameToMesh (mesh, geometry) {
	const wireframe = new THREE.WireframeGeometry( geometry )
	const lineMat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } )
	const line = new THREE.LineSegments( wireframe, lineMat )
	mesh.add(line)
}

const beatingIncrement = 0.008
let scaleThreshold = false
function beatingAnimation (mesh) {
	 // while the scale value is below the max,
	 // and the threshold is not reached, we increase it
	 if (mesh.scale.x < 1.4 && !scaleThreshold) {
	  mesh.scale.x += beatingIncrement * 2
	  mesh.scale.y += beatingIncrement * 2
	  mesh.scale.z += beatingIncrement * 2
	  // When max value is reached, the flag can be switched
	  if (mesh.scale.x >= 1.4) scaleThreshold = true
	 } else if (scaleThreshold) {
	  mesh.scale.x -= beatingIncrement
	  mesh.scale.y -= beatingIncrement
	  mesh.scale.z -= beatingIncrement
	  // The mesh got back to its initial state
	  // we can switch back the flag and go through the increasing path next time
	  if (mesh.scale.x <= 1) {
	   scaleThreshold = startAnim = false
	  }
	 }
}

let startAnim = false

function handleMouseIntersection (camera, scene, meshUuid) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onMouseIntersection( event ) {
      const coordinatesObject = event.changedTouches ? event.changedTouches[0] : event
      mouse.x = ( coordinatesObject.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( coordinatesObject.clientY / window.innerHeight ) * 2 + 1;

      raycaster.setFromCamera( mouse, camera );
      const intersects = raycaster.intersectObjects( scene.children );

      if (intersects.length && intersects[0].object.uuid === meshUuid) {
          startAnim = true
      }
  }

  mouse.x = 1
  mouse.y = 1

  return {
      onMouseIntersection
  }
}

function setControls (camera, domElement, deviceOrientationMode) {
  const controls = deviceOrientationMode ? new DeviceOrientationControls(camera) : new THREE.OrbitControls( camera, domElement )
	controls.update()
  return {
    controls
  }
}

(function init () {
  const {scene, camera, renderer} = createScene()
  const { controls } = setControls(camera, renderer.domElement, false)
  const { vertices, trianglesIndexes} = useCoordinates()
  const { geo, material, heartMesh } = createHeartMesh(vertices, trianglesIndexes)
  scene.add(heartMesh)
  addWireFrameToMesh(heartMesh, geo)
  const { onMouseIntersection } = handleMouseIntersection(camera, scene, heartMesh.uuid)

  window.addEventListener( 'click', onMouseIntersection, false )

  const animate = function () {
    requestAnimationFrame( animate )
    renderer.render( scene, camera )
    heartMesh.rotation.y -= 0.005
    startAnim && beatingAnimation(heartMesh)
    controls.update()
  }
  animate()
})()