    uniform float displacement;
    uniform float maxHeight;
    attribute float height;
    varying float fragHeight;
    void main()
    {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x,position.y,position.z*displacement,1.0);
    fragHeight = float(height/maxHeight);
    }