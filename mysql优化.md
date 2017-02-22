#MySQL优化设计
>设计:存储引擎，字段类型，范式
>功能:索引，缓存，分区
>架构:主从复制，读写分离，负载均衡

>>合理SQL： 测试，经验
>>mysql配置优化

-------------------------------------------
#存储引擎
--用来存储Mysql中对象（记录和索引）的一种特定的结构（文件结构）
--存储引擎，处于mysql服务器的最底层，直接存储数据。导致上层的操作，依赖于存储引擎的选择
*编译SQL->优化sql->执行sql->存储引擎层(Innodb,myisam,其它引擎)
*存储引擎就是特定的数据存储格式（方案）
*Show engines 查看mysql支持的引擎列表


#Innodb
>大于等于5.5  默认的存储引擎，mysql推荐使用的存储引擎
>提供事物，行级锁定，外键约束的存储引擎
>事物安全性存储引擎。更加注重完整性和安全性

>>存储格式
---数据索引集中存储,存储于同一个表空间文件中
---数据（记录行）
---索引（也占据空间）
---可以通过配置达到每一个innodb表，一个表空间文件的目的(方便删除某一张表的文件):
>>>>    set global innodb_file_per_table = 1
---数据按照主键顺序存储(插入时做排序工作，所以效率低)

>>特定功能
---事物:
---外键约束（维护数据的完整性）：

>>并发性处理:
---擅长处理并发的。
---行级锁定:row-level locking
----锁定粒度(范围上):
-----行级:提升并发性，开销大
-----表级:不利于并发性
----操作方面:
-----读锁：读操作时增加的锁，也叫共享锁。特征是  阻塞其它客户端的写操作，不阻塞读操作
-----写锁:写操作时的增加的锁，也叫独占锁或排它锁,X-lock,阻塞其他客户端的读操作
---多版本并发控制MVCC，效果达到无阻塞的操作


#MyISAM
>> <=5.5 Mysql默认的存储引擎

--ISAM：索引顺序存取方式,是一种文件系统
--特征:擅长高速读与插入
>>存储方式:
---数据索引存储在不同的文件中（.frm | myd | myi）
---数据的存储顺序按照插入顺序进行排序
>>功能
---全文索引支持(>=5.6 innodb支持)
---压缩数据的存储。 .MYD文件的压缩存储  所以占用的空间更小
---mysql的bin目录里面  myisampack.exe 对表进行压缩
----1.进入需要压缩的表数据目录(.myd文件目录)
----2.执行压缩指令 myisampack myisam_2
----3.压缩后需要重新修复索引：myisampack -rq on compressed table_name
---注:压缩优势，节省磁盘空间，减少磁盘IO开销
---注:压缩表为只读表，也就是很长一段时间内不会改变（如省市区表）
---注:如果需要更新，则需要进行解压，再压缩（重新索引）：  myisampack -unpack table_name
>>并发性
---仅仅支持表锁定
---支持并发操作。写操作钟的插入操作，不会阻塞读操作(其它操作)

>> innodb擅长数据完整性，并发性处理，擅长更新和删除
>> myisam 高速查询及插入。


#常见的引擎  Archive
--存档型
--仅提供  插入和查询操作。非常搞笑  无阻塞的插入和查询。

#常见的引擎  Memory
--内存型
--数据存储于内存中，存储引擎，缓存型存储引擎。

#插件试存储引擎   可以使用C/C++  来进行开发存储引擎

###注:功能满足-->考虑效率性


-----------------------------------------------------------
#字段类型选择
--满足要求
--原则:
---尽可能的小(占用存储空间小)
----Tinyint smallint mediumint int bigint
----varchar(N)  varchar(M)
----datetime(这个存储的----9999) timestamp(1970---2038)

---尽可能定长
----char  varchar
----decimal|边长 double(float)|定长

---尽可能使用整数
----IPV4  int unsigned   varchar(15)
----enum


#逆范式
--需要做一些逆范试的处理，打破范式 提高效率
--id className  studentCount
--id studentName classid


#索引的使用及类型
--利用记录的某部分数据，建立与记录的位置的对应关系,就是索引
--主索引  | 唯一索引 | 普通索引 | 全文索引
---无论什么索引，都是通过关键字与位置的对应关系来实现的
---以上类型的差异：对索引关键字的要求不同

--普通索引：对关键字没有什么要求
--唯一索引: 要求关键字不能重复,同时增加唯一约束
--主索引：  要求关键字不能重复，同时不能为null
--全文索引： 关键字的来源不是所有字段的数据，而是从字段中提取的特别关键字。

#索引的管理
--建表
    key(goods_name) 
    index(goods_name)
    unique index(user_name)
    primary key(id)
    fulltext index(desc)    
----除了主键索引，其它索引都可以取名字，全文索引只在myisam中支持

alter table table_name
    add key 'xingming' (`xing`,`ming`),
    .....

alter table table_name
    drop key 'xingming',
    .....

#执行计划   Explain
--可以通过在select语句前使用explain  来获取该查询采取什么样的计划
--注:  目前支持select（新版本支持改删）

#索引使用场景
--检索数据 

--索引排序
---如果orderby上面的字段  存在索引，可能就会使用到索引

--索引覆盖
---索引拥有的关键字内容，覆盖了查询所需要的全部数据，此时，就不需要在数据区获取数据，仅仅在索引区即可

--使用原则
---索引存在，没有满足使用原则，导致索引无效
*如果需要某个字段使用索引，需要在使用该字段的时候保持独立
*Like上面是否建立索引，需要考虑查询的时候  不能以通配符开头%_
*复合索引:一个索引关联多个字段index 'student name' (`student`,`name`)
--->仅仅针对左边的字段有效果

--注：即使满足上面的条件  mysql可能会弃用索引
--弃用索引的原因：查询即使使用索引，会出现大量的随机IO，相对于从数据记录的第一条遍历到最后一条，这个时候就会放弃索引

#目的：建立索引时，建立满足使用原则的字段上



#前缀索引
--通常会使用字段的整体作为索引关键字
--使用字段前部分数据，也可以去识别某些记录
语法:Index `index name` (`index_field`(N))  使用index_name 前N个字符建立的索引
----使用N长度所达到的辨识度，极限接近于使用全部长度的辨识度即可
----mysql 里面的函数substring是从1开始的

#全文索引（由于mysql不支持中文，后面使用sphinx.. 来解决全文索引）
--该类型的索引特殊在：关键字的创建上
--为了解决%keyword%这类查询的匹配问题
--text类型   文本类型，本身不会占用表的空间，它会在开辟一个text数据空间；比较varchar
--demo:
    alter table add fulltext index `title_body` (`title`,`body`);
    select * from articles where title like '%database%' or body like '%database%'; 这个不满足索引的规则，所以索引无效
--需要使用特殊全文索引语法
    select * from articles where match(title,body) against('database');
----停止词：in/In/on/or
    select * from articles where match(title,body) against('in'); //这个不能查到数据
    select * from articles where title like 'in%' or body like '%in%'; //这个能查到数据
------reason：全文索引的关键字，不是整个字段数据，而是从数据中提取的关键词（普通索引是把整个字段的数据作为关键字，而全文索引是以每个词为关键作为索引，所以遇到in就终止了）

#索引的数据结构了解(自己搜索)
--Hash
--Btree

#分区  partition
--将某张表的数据分布到各个分区上
--每个分区，就是独立的表；

---创建分区:  在创建表时，指定分区的选项
----Create table table_name(定义);
----Partition by 分区算法 (分区参数) 分区选项
------分区算法:
    set global Innodb_file_per_table = 1;
    create table partition_1(
        id int unsigned not null auto_increment.
        title varchar(255),
        primary key(id)
    )charset=utf8 engine=myisam; 

    partition by key (id) partitions 5;  ==>  id%5 求余   5个表

----注:  分区与存储引擎无关，是Mysql逻辑层完成
---- 查看是否支持分区   show variables like 'have_partitioning';

#分区的管理语法
show create table table_name   查看表的概括
--取余：key,hash
----增加分区数量(在原有的基础上增加了5个分区，但是数据不变)
    add partition partitions N
    alter table student_hash add partition partitions 5;
----减少分区数量(在原有的基础减少多少个分区)
    COALESCE partition N
    alter table student_hash coalesce partition partitions 7;

--条件:list range
----alter table table_name drop partition 分区名字(p_00)
----注:删除条件分区的时候，数据就会被破坏

#选择分区算法
--平均分配：就按照主键进行key(primary key)即可(非常常见)
--按照某种业务逻辑分区：选择那种整数型或者最容易被筛选的字段


#分表(<5.1):
--水平分表
--垂直分表（常用字段 - 非常用字段）
----列入学生表可以分为基础信息表和额外信息表


-------------------------------------------------------------------------
                      架构层面
-------------------------------------------------------------------------

--不仅仅是一台Mysql
--主从复制，读写分离，负载均衡

#主从复制（mysql自身就有复制功能，仅仅需要通过配置来完成）
-1主多从：
--1台mysql主机（写）   ==>  复制出来了N台MYSQL服务器（读）
--中间增加一台冗余的mysql服务器，以免宕机，成本高 
--心跳检测，就是按照规律来进行链接服务器，如果有效应就正常



#读写均衡  负载均衡（选择从服务器来进行读数据，把压力分散到服务器上）  （php程序）
--软件选择：Ameoba   mysql-proxy

注意：上面的这种架构可以提升整体服务器的效率；同时，服务器架构需要保证 高可用，7*24不宕机


----------------------------------------------------------------------------------
                             SQL语句优化（数据不一样，测试就能看得出快慢）       
----------------------------------------------------------------------------------

完成功能
#并发性的SQL：少用（不用）夺标操作(subquery,join),将复杂的SQL拆分多次执行。（可能对应需要的时间比较长，但是并发性大，也是需要的） 
----商品|分类： 
----select * from category     分类列表 
----select cat_id,count(*) from goods group by cat_id;  分类对应的商品数量

#如果查询很小，会增加查询缓存的利用率

#大量数据的插入:
--多条insert   
--Load data into table
--建议:先关闭约束及索引
----针对myisam:
    Alter table table_name disable keys;  禁用索引约束   ====>大量数据的插入
    Alter table table_name enable keys;启用
----针对innodb:
    Drop index,drop constraint （要保留主键，否则主键的顺序会被打乱）
    Begin transaction  | set autocommit=0;
    大量的数据插入
    commit
    add index,add constraint
----应该区分与每条记录的长度，以10*N（1-9）量级为单位
   insert into table_name values();  多次执行这个数据
   insert into table_name values(),(),(),();  批量执行这种数据

#分页
--Limit offset,size
--第五页数据: limit (page-1)*pageSize,size    如果这个越来越大  执行的时间相对就越长
--注意:limit的使用，会大大提升无效数据的检索（被跳过）
-----应该使用条件等过滤方式，将检索到的数据尽可能精确定位到需要的数据
------分页:  使用limit size;
    select id from collect order by id limit 90000,10
    查看http://www.2cto.com/database/201306/222535.html

#随机取10条数据
    select * from emp order by rand() limit 10;  效率低
    Order by rand()
    ---可以根据最小----数据最大量，进行md_rand(min,max) --->如果不存在再重新rand--->从数据表中获取数据

#慢查询日志（更改mysql的配置来进行设置）
--定位执行较慢的查询语句方案。
--show variables lile '%long_query%';
-->long_query_time = 10   超过该时间临界点就是慢

--set global slow_query_log = 1  //开启慢日志，全局的设置
--set long_query_time = 0.5  //针对当前客户端

----一旦开启慢日志功能，当查询的语句慢于0.5s 旧会在data目录下面产生一个慢日志文件，里面就包含产生慢日志的语句，就知道哪些语句需要优化操作的



---------------------------------------------------------------------------
                         mysql从配置上进行优化   
---------------------------------------------------------------------------
#mysql从配置上进行优化(mysql.ini)
--max_connections = 100  -->支持的最大连接数量(65535),极限
--myisam -->键缓冲的大小   key_buffer_size = 55M(1024M)  -->检索myisam的时候会很快
--table_cache=256()  -->表缓存，缓存的是表文件的句柄,对应的是表的物理文件，相当于缓存的文件，省掉了建立fopen的时间.缓冲了256个句柄,针对myisam管用的
--innodb_buffer_pool_size=107M  ---->  Innodb缓存，都是使用该缓存池；索引，事物日志缓存等















































































































































































































