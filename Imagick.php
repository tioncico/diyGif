<?php
/**
 * Created by PhpStorm.
 * User: x
 * Date: 2018-03-26
 * Time: 22:57
 */

    class Gif{
        public $im;
        private $NumberImages;

        public function __construct($gif_path)
        {
            $this->im = new Imagick($gif_path);
            $this->NumberImages = $this->im->getNumberImages();
        }

        public function drawText($text, $start, $len)
        {
            for($i = 0; $i < $len && $i + $start < $this->NumberImages; $i++)
            {
                $this->im->setIteratorIndex($start + $i);
                $this->im->drawImage($text);
            }
        }

        public function saveImages($file_name)
        {
            return $this->im->writeImages($file_name, false);
        }

        public function saveImage($file_name, $index)
        {
            $this->im->setIteratorIndex($index);
            return $this->im->writeImage($file_name);
        }
    }

    $gif = new Gif('1.gif');
//    echo $gif->im->getImageIndex();
    $text = "Hello World!";
    $color = new ImagickPixel('#000000');
    $draw = new ImagickDraw();
    $draw->setFontSize(20);
    $draw->setFillColor($color);
    $draw->setStrokeAntialias(true);
    $draw->setTextAntialias(true);
    $metrics = $gif->im->queryFontMetrics($draw, $text);
    $draw->annotation(0, $metrics['ascender'], $text);
//    $gif->drawText($draw, 10, 100);
//    $gif->saveImages('./a/3.png');
    $gif->saveImage('4.png', 0);