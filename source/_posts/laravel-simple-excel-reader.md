---
title: laravel框架自己简单实现高性能轻量级的Excel数据读取
date: 2021-11-04 17:59:45
tags:
    excel
    reader
    laravel
    phpspreadsheet
---

### 前言
一说到`php excel`数据读取，一般都会想到`phpspreadsheet`这个扩展。但从它的前身`phpexcel`以来读取大文件时的性能一直都是问题。

一次偶然的情况下发现了`.xlsx`后缀的Excel文件原来也是一个压缩包(可能是众所周知)，观察了解压出来的文件，发现存储数据的均为`xml`格式的文件。

前阵子项目中遇到大文件导入`phpspreadsheet`频繁导致内存超出报错，在百度谷歌没有找到替代品的情况家，遂决定自己手撸。

### 实现思路

##### 结构
在大致观察了解压缩出来的文件之后发现结构如下：
```
_rels
└ .rels
docProps
└ app.xml
└ core.xml
xl
└ _rels
　└ workbook.xml.rels
└ worksheets
　└ sheet1.xml
　└ sheet2.xml
　...
└ sharedStrings.xml
└ styles.xml
└ workbook
[Content_Types].xml
```
其中比较重要的有：
* `worksheets`文件夹下的`sheet.xml`用于存储每个`sheet`内的结构及数据
* `sharedStrings.xml`用于存储`sheet`内的字符串格式的数据，相当于是一张字典表

##### 解包
既然文件是压缩包，那么首要的问题就是解包，先解出来相关的`xml`文件。`php`原生扩展`zip`的类`ZipArchive`即可满足，相关语法：
```php
$zip = new \ZipArchive;

// 打开一个zip压缩包 
// public ZipArchive::open(string $filename, int $flags = 0): bool|int
$zip->open($filename);

// 解压缩文件
// ZipArchive::extractTo(string $destination, mixed $entries = ?): bool
// $entries 可以指定解压缩的文件列表
$zip->extractTo($destination, $entries);
```

##### 解析XML
接下来就需要解析XML的数据了。使用的依旧是原生扩展`SimpleXML`的`simplexml_load_file()`方法，将XML文件解析为`SimpleXMLElement`对象。由于`SimpleXMLElement`实现了`RecursiveIterator`接口，所以我们可以遍历解析结果读取数据。
```php
/*
 * 将 XML 文件解释为对象
 * simplexml_load_file (
 *     string $filename,
 *     ?string $class_name = SimpleXMLElement::class,
 *     int $options = 0,
 *     string $namespace_or_prefix = "",
 *     bool $is_prefix = false
 * ): SimpleXMLElement|false
 */
$xmlData = simplexml_load_file($filename);
```

##### 存储解析数据
如果将全部的数据存储到数组或者对象里，势必还是会导致内存飙升。由于使用的框架是`laravel`，所以使用惰性集合`LazyCollection`来存储解析数据，降低内存使用率。这里可以参考`laravel`的官方文档[惰性集合](https://learnku.com/docs/laravel/9.x/collections/12225#295d3a)，大致的使用方式如下：
```php
use Illuminate\Support\LazyCollection;

$xmlData = simplexml_load_file($filename);

LazyCollection::make(function () use ($xmlData) {
    foreach ($xmlData as $node) {
        ....
        yield $data;
    }
});

```

> 如果非laravel框架或较低版本的laravel框架，在没有`LazyCollection`的情况下，可以考虑使用`yield`自己封装

##### 封装
基于以上思路及知识，接下来就可以简单封装一个解析Excel的类：
```php
<?php

namespace App\Services;

use Illuminate\Support\LazyCollection;

class ExcelReader
{

    const SUBDAYS = 25569;
    const UZIPPAH = 'uzip';
    const MAPNAME = 'xl/sharedStrings.xml';
    const SHEETNAME = 'xl/worksheets/sheet%d.xml';

    public static function read($filename, $sheetNumber = 1, $withTitle = true)
    {
        $pathinfo = pathinfo($filename);

        $uzipPath = storage_path(static::UZIPPAH . '/' . $pathinfo['filename']);
        $sheetName = sprintf(static::SHEETNAME, $sheetNumber);

        $zip = new \ZipArchive;
        try {
            $zip->open($filename);
            $zip->extractTo($uzipPath, [
                static::MAPNAME,
                $sheetName
            ]);
            $zip->close();
        } catch (\Throwable $th) {
            Log::error('文件解压缩失败', [$filename]);
            throw $th;
        }

        try {
            $mapOrigin = simplexml_load_file($uzipPath . '/' . static::MAPNAME);
            $maps = array();
            foreach ($mapOrigin->si as $s) {
                if (isset($s->r)) {
                    $si = '';
                    foreach ($s->r as $sr) {
                        $si .= $sr->t;
                    }
                } else {
                    $si = $s->t . '';
                }
                $maps[] = $si;
            }
        } catch (\Throwable $th) {
            Log::error('字典解析失败', [
                $filename, 
                $uzipPath . '/' . static::MAPNAME, 
                $th->getMessage()
            ]);
            throw $th;
        }

        try {
            $sheetXmls = simplexml_load_file($uzipPath . '/' . $sheetName);
            $sheetDatas = LazyCollection::make(function () use ($withTitle, $sheetXmls, $maps) {
                $titles = array();
                foreach ($sheetXmls->sheetData->row as $row) {
                    $data = array();
                    foreach ($row->c as $col) {
                        $column = trim($col['r'], $row['r']);
                        $withTitle && $titles AND $column = $titles[$column] ?? $column;
                        switch ($col['t'] . '') {
                            case 's':
                                $data[$column] = $maps[intval($col->v)] ?? '';
                                break;
                            case 'str':
                                $data[$column] = false;
                            case 'inlineStr':
                                $data[$column] = $col->is->t . '';
                                break;
                            default:
                                $data[$column] = $col->v . '';
                                break;
                        }
                    }
                    if ($withTitle && $row['r'] == 1) {
                        $titles = $data;
                    } else {
                        yield $data;
                    }
                }
            });
        } catch (\Throwable $th) {
            Log::error('数据解析失败', [
                $filename, 
                $uzipPath . '/' . $sheetName, 
                $th->getMessage()
            ]);
            throw $th;
        }

        @unlink($uzipPath . '/' . static::MAPNAME);
        @unlink($uzipPath . '/' . $sheetName);

        return $sheetDatas;
    }
}

```

使用示例：
```php

// 带表头的表格
$xmlData = ExcelReader::read('./demo1.xlsx', 1);
foreach ($xmlData as $row) {
    dd($row['姓名']);
}

// 无表头的表格
$xmlData = ExcelReader::read('./demo2.xlsx', 1, false);
foreach ($xmlData as $row) {
    dd($row['A'], $row['AB']);
}

// 获取总条数 不太推荐，因为还是会遍历整个表格来计数
dd($xmlData->count());

```

##### 遗留问题
* Excel的日期格式存储的值是一个数字，值为1900年至今的天数，而程序里的时间戳起始时间是1970年，所以如果自己转换日期需要用这个值减去`ExcelReader::SUBDAYS`的值25569天。
* 由于使用了`yeild`数据并没有完整加载到内存中，所以Excel的公式没有办法计算(跨行)

### 参考文档
[https://www.php.net/manual/zh/book.zip.php](https://www.php.net/manual/zh/book.zip.php)
[https://www.php.net/manual/zh/book.simplexml.php](https://www.php.net/manual/zh/book.simplexml.php)
[https://www.php.net/manual/zh/language.generators.syntax.php](https://www.php.net/manual/zh/language.generators.syntax.php)
[https://learnku.com/docs/laravel/9.x/collections/12225#lazy-collections](https://learnku.com/docs/laravel/9.x/collections/12225#lazy-collections)

