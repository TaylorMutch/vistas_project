"""
This script converts from a simple binary elevation format to ArcASCII. The format of the binary file is:

Offset    Type    Description
-----------------------------
0         uint    Grid width
4         uint    Grid height
8         float*  Elevation values as floats in row-major order from lower-left to upper-right.
"""

import os
import struct
import sys
import math


# input() in Py2 processes numbers only, so map to raw_input
#if sys.version_info[0] < 3:
#    input = raw_input


def main():
    if len(sys.argv) < 3:
        print('Usage: convert_envi.py <input grid> <output bin>')
        sys.exit(-1)

    input_path, output_path = sys.argv[1:3]
    if os.path.exists(output_path):
        overwrite_message = '{0} already exists. Overwrite? [y/n] '.format(output_path)
        if not input(overwrite_message).lower().startswith('y'):
            sys.exit(-1)


    with open(output_path, 'wb') as f_out:
        with open(input_path, 'rb') as f_in:

            # skip first two lines with \n's and form_feed character
            f_in.readline()  # longitudes
            f_in.readline()  # latitudes
            f_in.read(1)     # form feed character

            '''By the time this script is called,
            the user will have already inputted the coordinates, and we can do an
            interpolation to dictate how many slices between edge coordinates.
            So basically, we just skip this stuff...
            '''

            begin_binary = f_in.tell()
            width = 458
            height = 458

            # Check to make sure we have a file of correct size. Additionally we get
            # the cursor in the right position to start reading data.
            f_in.seek(0, os.SEEK_END)
            assert f_in.tell() == width * height * 4 + begin_binary

            # The binary format orders rows from bottom to top, while the ArcASCII format orders top to bottom.
            # So we'll read from the end of the binary file backwards

            f_in.seek(27,os.SEEK_SET)
            heightMap = struct.unpack('f' * width * height, f_in.read(4*width*height))

            max = 0
            for val in heightMap:
                if val > max:
                    max = val
            max = math.ceil(max)  # TODO: We need to record this in our now Model object
            print(max)

            f_check = open(f_out.name + '_check', 'w')
            for i in range(1, height + 1):
                f_in.seek(-i * width * 4, os.SEEK_END)
                row = (struct.unpack('f' * width, f_in.read(width * 4)))
                newFileBytes = (int(x/max*65535) for x in row) # scale the value to full value of a unsigned int
                line = (str(x) for x in row)
                f_check.write(' '.join(line) + '\n')
                for i in newFileBytes:
                    f_out.write(struct.pack('H', i))
            f_check.close()

if __name__ == '__main__':
    main()