<?php
/**
 * Created by PhpStorm.
 * User: x
 * Date: 2018-03-28
 * Time: 20:59
 */

namespace App\HttpController;

use EasySwoole\Core\Utility\Random;
use App\Utility\Gif;

class Edit extends Base
{
    public function index()
    {
        $gif_name = $this->request()->getQueryParam('gif_name');
        if($gif_name === null){
            return $this->writeJson(502);
        }
        if(!file_exists($this->Upload_Path . '/gif/' . $gif_name . '.gif')){
            return $this->writeJson(502);
        }
        $gif_info = [];
        $gif_info['pngNum'] = count(scandir($this->Upload_Path . "/png/$gif_name/")) - 2;
        $gif_info['pngList'] = [];
        for($i = 0; $i < $gif_info['pngNum']; $i++){
            $gif_info['pngList'][] = "/png/$gif_name/$gif_name-$i.png";
        }
        $this->response()->setCookie('save_name', Random::randStr(13));
        $this->readTplFile('edit.html');
        $this->assign('gif_info', $gif_info);
        $this->display();
    }

    public function save(){
        $gif_name = $this->request()->getQueryParam('gif_name');
        $save_name = $this->request()->getCookieParams('save_name');
        $text_list = $this->request()->getParsedBody('text_list');
        if(empty($gif_name) || empty($save_name) || empty($text_list)){
            return $this->writeJson(502);
        }
        if(!file_exists($this->Upload_Path . "/diy/$gif_name")){
            mkdir($this->Upload_Path . "/diy/$gif_name");
        }
        $gif = new Gif($this->Upload_Path . "/gif/{$gif_name}.gif");
        foreach ($text_list as $item) {
            $gif->drawText([
                'text' => $item['text'],
                'font_size' => $item['font_size'],
                'x' => $item['x'],
                'y' => $item['y'],
                'index' => $item['index'],
                'len' => $item['len'],
            ]);
        }
        if($gif->saveImages($this->Upload_Path . "/diy/$gif_name/{$save_name}.gif")){
            return $this->writeJson(200, [
                'download_url' => "/diy/$gif_name/{$save_name}.gif"
            ]);
        }else {
            return $this->writeJson(502, null, '保存失败!');
        }
    }
}