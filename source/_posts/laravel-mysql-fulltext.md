---
title: 在laravel中使用mysql fulltext全文索引代替like查询
date: 2022-08-23 17:23:22
tags:
    - mysql
    - laravel
    - fulltext
    - index
---

在laravel中使用`mysql` `fulltext`全文索引代替`like`提高性能(众所周知`like`查询以`%`开头，会导致索引失效)。

### 创建全文索引
首先需要注意：
> InnoDB 在 mysql5.6才支持全文索引。全文索引默认是英文分词(即空格分词)，在mysql5.7.6中内置了ngram全文解析器, 用来支持亚洲语种的分词

所以如果需要搜索中文需要mysql版本>=5.7.6

创建索引SQL：
##### 1.使用`CREATE TABLE`创建
```mysql
CREATE TABLE tbl_name(
...
FULLTEXT INDEX [index_name] (key_part,...) WITH PARSER `ngram`
)
```

##### 2.使用`ALTER TABLE`创建
```mysql
ALTER TABLE tbl_name
ADD FULLTEXT INDEX [index_name] (key_part,...) WITH PARSER `ngram`
```

##### 3.使用`CREATE INDEX`创建
```mysql
CREATE FULLTEXT INDEX index_name ON tbl_name (key_part,...)  WITH PARSER `ngram`
```

### 执行搜索
```myql
MATCH (col1,col2,...) AGAINST (expr [search_modifier])
```
使用全文索引进行搜索时有三种模式：
##### 1.自然语言模式[IN NATURAL LANGUAGE MODE]
默认模式，不能使用操作符，即搜索的词必须要出现
> 例子：SELECT * FROM tbl_name WHERE MATCH(name,summory) AGAINST ('测试')

##### 2.布尔模式[IN BOOLEAN MODE]
可以使用操作符，支持指定关键词必须出现(+)、必须不能出现(-)或权重高低
>例子：SELECT * FROM tbl_name WHERE MATCH(name,summory) AGAINST ('+测试 -公司' IN BOOLEAN MODE)

##### 3.查询扩展模式[IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION]
基于自然语言模式，根据自然模式搜索到的结果扩展查询

> 例子：SELECT * FROM tbl_name WHERE MATCH(name,summory) AGAINST ('测试' IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION)

### 在laravel中使用

##### 1.laravel框架在9.x中已支持全文索引

```php
// 自然语言模式
DB::table('tbl_name')->whereFullText('name', '测试')->get();
// 布尔模式
DB::table('tbl_name')->whereFullText(['name', 'summory'], '+测试 -公司', ['mode' => 'boolean'])->count();
// 自然扩展模式
DB::table('tbl_name')->whereFullText('name', '测试', ['expanded' => true])->paginate(10);
// 模型使用
User::query()->whereFullText('name', '测试')->get();
```

##### 2.laravel9以下的版本需要自己扩展`Builder`和`MySqlGrammer`
找到框架`AppServiceProvider`的`boot()`方法，增加如下代码

> 代码参考laravel9.x的官方实现，用法上也完全相同。框架升级时也可以避免重新修改业务代码。

```php
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\Grammars\MySqlGrammar;

...

public function boot()
{

    /**
     * 扩展 MySqlGrammar
     */
    MySqlGrammar::macro('whereFulltext', function(QueryBuilder $query, $where) {
        $columns = implode(',', array_map(function($column) use ($query){
            return $this->wrap($column);
        }, $where['columns']));

        $value = $this->parameter($where['value']);

        $mode = ($where['options']['mode'] ?? []) === 'boolean'
            ? ' in boolean mode'
            : ' in natural language mode';

        $expanded = ($where['options']['expanded'] ?? []) && ($where['options']['mode'] ?? []) !== 'boolean'
            ? ' with query expansion'
            : '';

        return "match ({$columns}) against (".$value."{$mode}{$expanded})";
    });

    /**
     * 扩展 Builder
     */
    Builder::macro('whereFullText', function($columns, $value, array $options = [], $boolean = 'and') {
        $type = 'Fulltext';

        $columns = (array) $columns;

        $this->wheres[] = compact('type', 'columns', 'value', 'options', 'boolean');

        $this->addBinding($value);

        return $this;
    });
}
```

### 参考文档
* [https://learnku.com/docs/laravel/9.x/queries/12246#648b12](https://learnku.com/docs/laravel/9.x/queries/12246#648b12)
* [https://dev.mysql.com/doc/refman/5.7/en/innodb-fulltext-index.html](https://dev.mysql.com/doc/refman/5.7/en/innodb-fulltext-index.html)
* [https://dev.mysql.com/doc/refman/5.7/en/fulltext-search.html](https://dev.mysql.com/doc/refman/5.7/en/fulltext-search.html)

