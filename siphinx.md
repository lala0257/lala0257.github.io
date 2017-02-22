#sphinx什么时候用
----检索数据  %content%  可以使用(搜索)
----全战静态化

#流程:php先把要搜索的短语发给sphinx服务器,sphinx返回的是记录的id
#sphinx有两种使用方式
1.sphinx和mysql是两个独立的服务器
2.sphinx集成到mysql里去(没有单独的sphinx服务器)--->linux服务器，把sphinx当成插件重新编译到mysql
---php只需要写一个sql语句即可，不用管sphinx，mysql会自己连接查询sphinx


#使用coreseek 是在sphinx基础上增加了对中文的支持(sphinx支持英文、俄文)
1.对/etc目录下面  针对你要使用的数据库进行配置  如mysql
2./bin目录下面  indexer.exe  针对配置文件进行配置全文索引
3./bin目录下面  searchd.exe   启动sphinx服务器,需要执行上面索引配置文件才能正常使用
4./api目录下面  提供你需要使用哪种语言进行开发，里面就是类库


#详细配置流程
1.复制mysql.conf文件到根目录下面  改名sphinx.conf,并进行配置
2.生成索引配置文件（生成某个索引的数据源/--all）
---indexer.exe -c .../sphinx.conf goods[-all]
3.启动sphinx服务器(管理员cmd窗口)
---searchd.exe -c .../sphinx.conf --install[--delete]
4.services.msc   启动searchd.exe(请核对32位或者64位的版本)

#php使用coreseek
1.找到api  复制到项目中，使用该文件(
    require './Sphinxapi.php'
    $sc = new SphinxClient();
    $sc->setServer('localhost',9312)
    $res = $sc->query('白色')   -->返回的只是查找的id,所以需要连接数据库进行联合查询，得到详细信息

    <?php
    $s = new SphinxClient;
    $s->setServer("localhost", 9312);
    $s->setArrayResult(true);
    $s->setSelect();
    $s->setMatchMode(SPH_MATCH_ALL);
    
    $result = $s->query('美女', 'test1');
    print_r($result);?>


#   sphinx生成索引时只会为当前数据库中的数据生成索引，生成索引之后如果在数据库中又添加了新的数据，那么在sphinx是无法搜索到新的
#的数据的，需要把数据也生成索引并添加到sphinx中去才行。

#   如果每次插入新的数据之后都要手动再重建索引太麻烦了，所以我们一般要配置sphinx每隔一段时间自动把数据库中最新插入的数据重新
#生成新的索引文件，并把这个新的索引文件合并到主索引文中上去。

#实际操作：
1.每次生成索引文件之后，要把最后一条记录的id保存下来，下次id大于这个id就是最新的数据
--11.建一张表来存这个id     table sphinx_id(max_int unsigend not null comment '已经是创建好索引的最后一条记录')
--12.让每次生成索引之后，能够更新到这个数据库里面去（sphinx.conf--> sql_query_post = UPDATE sphinx_id set max_id = (select max(id) from php34_goods)）

2.定期的为新数据生成索引
--11.修改sphinx定义一个新的数据源（新插入的还没有创建索引的数据源）  source  goods_02
--12.再添加一个index索引    index goods_02
--13.写一个bat脚本或者linux:shell脚本，定期把新的数据源索引文件，并把这个索引文件合并到主索引(第一次生成的索引文件)文件上

#bat文件内容
#生成新的索引（根据索引）
 D:\coreseek-4.1-win32\bin> .\indexer.exe -c D:\coreseek-4.1-win32\csft_mysql.conf goods_02
 #合并原先的索引
 D:\coreseek-4.1-win32\bin> .\indexer.exe -c D:\coreseek-4.1-win32\csft_mysql.conf --merge goods goods_02 --rotate

3.windows 任务计划程序,进行配置该文件执行时间




##Sphinx+MySQL5.1x+SphinxSE+mmseg中文分词(参考)
http://blog.csdn.net/tjcyjd/article/details/37566449




















