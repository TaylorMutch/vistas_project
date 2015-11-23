    varying float fragHeight;
    vec4 colorScale(float yval) {
    float a[7];
    a[0] = 0.;
    a[1] = .1;
    a[2] = .2;
    a[3] = .5;
    a[4] = .75;
    a[5] = .8;
    a[6] = 1.;
    vec4 colors[8];
    colors[0] = vec4(.4,.4,1,1);
    colors[1] = vec4(.75,.75,.56,1);
    colors[2] = vec4(.3,.8,.3,1);
    colors[3] = vec4(.2,.6,.2,1);
    colors[4] = vec4(.4,.38,.0,1);
    colors[5] = vec4(.8,.8,.8,1);
    colors[6] = vec4(1,1,1,1);
    colors[7] = vec4(1,1,1,1);

    vec4 myColor;
    if (yval <= a[0]) {
         myColor = colors[0];
    }
    else {
         for (int i = 1; i < 7; i++) {
            if (yval < a[i]) {
              myColor = mix(colors[i], colors[i+1],  smoothstep(a[i-1],a[i],yval)  );
              break;
            }
         }
    }
   return myColor;
    }
    void main() {
        gl_FragColor = colorScale(fragHeight);
    }