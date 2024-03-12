# Layout: Fixed

Each "unit" is a fixed width, which was the only layout available in Dashboard 1.0. 

It is built as a flexbox layout, with a single row of widgets. Width of each group is a fixed pixel size, calculated as the "width" property of a group, multiplied by 90px (where our default row height is 45px).

It will automatically move widgets to the next row if they don't fit within a given screen width. The height of each row is determined by the tallest widget in that row.

![Fixed Layout](../../assets/images/layout-eg-flex.png){data-zoomable}
*An example UI rendered using the "Fixed" Layout*
