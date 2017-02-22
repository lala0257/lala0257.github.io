#非关系型数据库:nosql-->键值对
新版本的mongodb参照http://www.cnblogs.com/hanyinglong/archive/2016/07/25/5704320.html

memcache:数据存在内存中
mongodb:数据也是存在硬盘的(默认没有开启权限功能，需要创建好管理员帐号)  ---(无模式操作，就是没有user表,就可以db.user.help())
---mongodb是面向文档的数据库:一条记录叫做文档，多个文档放到一起叫做集合
mongodb与mysql最大的区别:
--mongodb使用javascript语言操作。mysql使用sql
--mongodb以json形式保存一条记录,读、写方面非常快
--mongodb扩展容易(分表、分库、读写分离、分布式存储非常容易实现,配置一下即可),mysql的扩展也可以做到，但性能和维护成本高
--所以mongodb适合存储：数据结构简单、数据量非常大，高并发读写的操作
--mongodb在保存关系比较复杂的数据时不太容易，不支持关系和连表相对数据中一对多和多对多的关系

mysql:    member表与friend表
mongodb:  member表   {username:'tome',friends:[1,2,3,4]}

非常适合:数据量大、数据结构单一的数据存储(比如:投票、日志等等)。

实际操作:
--安装Mongodb
---先创建一个目录(用来存放mongodb中的数据)和一个文件（mongodb日志文件）
---执行Mongodb中的Mongodb.exe 来安装
---->mongodb.exe --install --dbpath d:/mongodb/data --logpath d:/mongodb/log.txt
(   mongod --dbpath d:/mongodb/data  就开启了mongodb;
    打开一个新的命令窗口就可以使用了
)
---打开服务service.msc  查看Mongodb并启动(可能查不到)

--运行mongo.exe客户端程序，链接到服务器上进行操作
---在客户端就可以执行javascript语句

--客户端的使用
---db变量的使用--->当前正在使用的数据库的名字 
---切换数据库: use 库名
---查看所有的数据库：  show dbs
---查看有哪些命令: 帮助 
-----help  系统级
-----数据库级别的帮助   db.help()
-----db.集合名字.help() 集合表级别的帮助


--demo:向php34数据库中的商品goods集合中插入数据
----use php34
----db.goods.insert( {"goods_name":"thinkpad","shop_price"："100"} )
---注:插入记录时，如果字段中没有_id字段,mongodb会自动添加上一个_id字段，这个字段的类型是ObjectId,这个字符串在全球是唯一的
-----mongodb执行的每个操作都是瞬间完成的
--demo_02:查询商品集合，所有的商品
----db.goods.find()

----修改一条记录:（修改一条记录）   
                   var goods = db.goods.findOne({"goods_name":"lalala"})
                   goods.shop_price = "1112.12"
                   db.goods.save(goods)
    db.goods.update({"goods_name":"lalala"},{"$set":{"shop_price":"1112.12"}})  

----下面这种方式会修改整条记录，原先存在的字段就没了
    db.goods.update({"goods_name":"lalala"},{"shop_price":"1112.12"})


--删除表:db.goods.drop()


--批量修改--数据
    1.前言
    最近在学习MongoDB，数据修改这一部分的内容较多，命令比较繁琐，所以将一些常用的修改命令总结在这篇博客中，
    方便今后学习的查阅。

    2.命令总结
        1). insert()
        db.collection.insert(x) x就是要更新的对象，只能是单条记录，如：
        db.collection.insert({_id:1,name:"test",count:1})
        当需要批量插入的时候，可以在shell中使用for循环，如：
        for(var i=0;i<16;i++){ 
        db.mytest.insert({_id:i,name:"test"+i,count:i}) 
        }
        此时如果用find()命令查询插入的数据，结果是这样的：

        > db.mytest.find()
        { "_id" : 0, "name" : "test0", "count" : 0 }
        { "_id" : 1, "name" : "test1", "count" : 1 }
        { "_id" : 2, "name" : "test2", "count" : 2 }
        { "_id" : 3, "name" : "test3", "count" : 3 }
        { "_id" : 4, "name" : "test4", "count" : 4 }
        { "_id" : 5, "name" : "test5", "count" : 5 }
        { "_id" : 6, "name" : "test6", "count" : 6 }
        { "_id" : 7, "name" : "test7", "count" : 7 }
        { "_id" : 8, "name" : "test8", "count" : 8 }
        { "_id" : 9, "name" : "test9", "count" : 9 }
        { "_id" : 10, "name" : "test10", "count" : 10 }
        { "_id" : 11, "name" : "test11", "count" : 11 }
        { "_id" : 12, "name" : "test12", "count" : 12 }
        { "_id" : 13, "name" : "test13", "count" : 13 }
        { "_id" : 14, "name" : "test14", "count" : 14 }
        { "_id" : 15, "name" : "test15", "count" : 15 }

    

        2). update()
        db.collection.update( criteria, objNew, upsert, multi ) 四个参数的说明如下：
        criteria: update的查询条件，类似sql update查询内where后面的
        objNew: update的对象和一些更新的操作符（如$,$inc...）等，也可以理解为sql update查询内set后面的
        upsert: 这个参数的意思是，如果不存在update的记录，是否插入objNew,true为插入，默认是false，不插入。
        multi: mongodb默认是false,只更新找到的第一条记录，如果这个参数为true,就把按条件查出来多条记录全部更新。

        几个查询例子如下：
        db.mytest.update({count:{$gt:1}},{$set:{name:"ok"}}) 只更新第一条记录
        db.mytest.update({count:{$gt:3}},{$set:{name:"ok"}},false,true) 大于3的全部更新了
        db.mytest.update({count:{$gt:4}},{$set:{name:"ok123"}},true,false) 只更新了一条
        db.mytest.update({count:{$gt:6}},{$set:{name:"ok123"}},true,true) 大于6的全部更新了
    

        3). save()
        db.collection.save(x) x是要插入的对象，效果与上面的insert命令一样。save与insert的区别是这样的：
        在进行插入数据的操作中，当遇到_id相同的情况下，save完成保存操作，insert则会保存；即_id相同情况下，save相当于更新操作。


#mongodb权限机制(老版本,一个帐号只属于一个数据库,不能操作多个数据库，但是超级管理员可以)

1.添加 修改帐号  登陆
    db.addUser(用户名,密码,是否只读)(默认全部权限，如果设置true则只读)
    db.auth(用户名，密码)--->登陆

    列入:添加一个管理员用户
        use admin  选择管理员数据库(超级管理员)
        db.addUser("root","1234")  把用户添加到admin
    列入:向sns数据库中添加一个只读的普通用户
        use sns
        db.addUser("test","1234")     
         
2.启动权限机制(重新安装mongodb，安装时添加一个--auth参数)
    /bin目录下面   mongodb --remove   其实并没删除数据库里面的数据  只是把安装好的从系统服务上面清除掉
    mongodb --install --dbpath d:/mongodb/data --logpath d:/mongodb/log.txt --auth
    现在就开启了权限机制

3.登陆   
    db.auth('root','1234')  如果返回1就登陆成功



#php操作Mongodb(跟在命令行操作差不多,php服务器安装了mongodb扩展-->phpinfo)
    $mongo = new Mongodb("mongodb://test:1234@127.0.0.1/php34");
    $user = $mongo->php34->user->find();
    dump($user);


#php如何安装mongodb扩展
    1.下载php_mongodb.dll  扩展文件
    2.把dll复制到extension_dir目录下面
    3.重启apache即可
    4.php.ini修改扩展配置，启用mongodb扩展


#mongodb其它常用的功能(hadoop 处理大数据)








