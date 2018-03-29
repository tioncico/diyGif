<?php
/**
 * Created by PhpStorm.
 * User: x
 * Date: 2018-03-27
 * Time: 23:11
 */

namespace  App\Utility;

class Gif
{
    public $im;
    private $NumberImages;

    public function __construct($gif_path)
    {
        $this->im = new \Imagick($gif_path);
        $this->NumberImages = $this->im->getNumberImages();
    }

    public function getNumberImages()
    {
        return $this->NumberImages;
    }

    public function drawText($config)
    {
        $draw = new \ImagickDraw();
        $draw->setFontSize($config['font_size']);
        $draw->setFillColor(new \ImagickPixel('rgb(255, 255, 255)'));
        $draw->setFont(EASYSWOOLE_ROOT . '/1.ttf');
        $draw->setStrokeAntialias(true);
        $draw->setTextAntialias(true);
        $draw->annotation($config['x'], $config['y'], $config['text']);
        $this->drawImage($draw, $config['index'], $config['len']);
    }

    public function drawImage($text, $start, $len)
    {
        for($i = 0; $i < $len && $i + $start < $this->NumberImages; $i++)
        {
            $this->im->setIteratorIndex($start + $i);
            $this->im->drawImage($text);
        }
    }

    public function saveImages($file_name, $adjoin = true)
    {
        return $this->im->writeImages($file_name, $adjoin);
    }

    public function saveImage($file_name, $index)
    {
        $this->im->setIteratorIndex($index);
        return $this->im->writeImage($file_name);
    }
}