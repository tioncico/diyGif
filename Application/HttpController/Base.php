<?php
/**
 * Created by PhpStorm.
 * User: x
 * Date: 2018-03-26
 * Time: 12:28
 */

namespace App\HttpController;

use EasySwoole\Core\Http\AbstractInterface\Controller;
use EasySwoole\Core\Swoole\Coroutine\PoolManager;

class Base extends Controller
{
    protected $Upload_Path = EASYSWOOLE_ROOT . '/Upload';
    protected $tpl;

    public function index()
    {
        // TODO: Implement index() method.
    }

    protected function readTplFile($file_name)
    {
        $this->tpl = file_get_contents(EASYSWOOLE_ROOT . '/Application/Html/' . $file_name);
    }

    protected function assign($name, $val)
    {
        if(is_array($val)){
            $val = json_encode($val);
        }
        $this->tpl = str_replace('"$' . $name . '$"', $val, $this->tpl);
    }

    protected function display()
    {
        $this->response()->write($this->tpl);
    }
}