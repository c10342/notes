
indexOf(searchElement,fromIndex)

查找的值作为第一个对象，一般用来查找基本类型的数据，如果是对象类型，就判断是否为同一个引用。使用`===`进行对比

findIndex(function(item,index){})

比较函数作为第一个参数，一般用来比较非基本类型的数据。返回`true`就表示查找成功