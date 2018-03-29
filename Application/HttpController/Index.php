<?php
/**
 * Created by PhpStorm.
 * User: x
 * Date: 2018-03-20
 * Time: 14:51
 */

namespace App\HttpController;

use App\Utility\Gif;

class Index extends Base
{

    public function index()
    {
//        $this->response()->redirect('http://192.168.1.1', 302);
        $this->readTplFile('index.html');
        $this->display();
    }

    public function getGifList()
    {
        $list = scandir($this->Upload_Path . '/gif/');
        $result = [];
        for($i = 2; $i < count($list); $i++){
            $img_name = substr($list[$i], 0, -4);
            $result[] = [
                'img_name' => $img_name,
                'img_url' => '/png/' . $img_name . '/' . $img_name . '-0.png'
            ];
        }
        $this->writeJson(200, $result);
    }

    public function upload(){
        $upload_file = $this->request()->getUploadedFile('file');
        if(!$upload_file || $upload_file->getClientMediaType() !== 'image/gif'){
            return $this->writeJson(502);
        }
        $file_name = md5(rand(0, 1000).time());
        $file_path = $this->Upload_Path . '/gif/' . $file_name . '.gif';
        $upload_file->moveTo($file_path);
        mkdir($this->Upload_Path . '/png/' . $file_name);
        $gif = new Gif($file_path);
        $gif->saveImages($this->Upload_Path . '/png/' . $file_name . '/' . $file_name . '.png', false);
        $this->writeJson(200, [
            'img_name' => $file_name,
            'img_url' => '/png/' . $file_name . '/' . $file_name . '-0.png'
        ]);
    }

    public function getImg()
    {
        $gif_name = $this->request()->getQueryParam('gif_name');
        $gif_index = $this->request()->getQueryParam('gif_index');
        if($gif_index === null){
            $gif_index = 0;
        }
        $img_path = $this->Upload_Path . '/gif/' . $gif_name . '.gif';
        $index_path = $this->Upload_Path . '/png/' . $gif_name . '/' . $gif_name . '-' . $gif_index . '.png';

        if(!file_exists($img_path)){
            return $this->writeJson(502, [], '文件不存在!');
        }
        if(!file_exists($index_path)){
            if(!file_exists($this->Upload_Path . '/png/' . $gif_name . '/')){
                mkdir($this->Upload_Path . '/png/' . $gif_name . '/');
            }
            $gif = new Gif($img_path);
            if($gif->getNumberImages() <= $gif_index || $gif_index < 0){
                return $this->writeJson(502, [], '文件不存在!');
            }
            $gif->saveImages($this->Upload_Path . '/png/' . $gif_name . '/' . $gif_name . '.png', false);
        }
        $this->response()->withAddedHeader('Content-Type', 'image/png');
        $this->response()->write(file_get_contents($index_path));
    }
}