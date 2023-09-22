var listdata = new Array()

function toOne(num) {
    num = String(num)
    var arr = num.split('.')
    if (arr[1][0] == 0) {
        return arr[0]
    } else {
        return arr[0] + "." + arr[1][0]
    }
}

function byteToString(num) {
    num = num / 1000
    if (num < 1024) {
        return toOne(parseFloat(num)) + "K";
    } else if (num < (1024 * 1024)) {
        return toOne(parseFloat(num) / 1024) + "M";
    } else {
        return toOne(parseFloat(num) / 1024 / 1024) + "G";
    }
}

function starToColor(star) {
    if (star > 80) {
        return 'danger'
    } else if (star > 60) {
        return 'success'
    } else if (star > 40) {
        return 'info'
    } else {
        return 'warning'
    }
}

function showList(data) {
    var html = ''
    for (var i = 0; i < data.length; i++) {
        html += '<div class="col-md-6 col-lg-4">\
                            <div class="media p-3 rounded mb-2 list-group-item-action" rel="' + data[i].版本号 + '">\
                                <img src="' + data[i].图标 + '" alt="SHSSEDU软件中心" class="mr-3 mt-3" style="width:60px;">\
                                <div class="media-body">\
                                    <h4>' + data[i].名称 + '</h4>\
                                    <div class="progress mb-1">\
                                        <div class="progress-bar bg-' + starToColor(data[i].评分) + '" style="width:' + data[i].评分 + '%">评分：' + data[i].评分 + '分</div>\
                                    </div>\
                                    <a rel="' + data[i].详情地址 + '" class="text-info mr-3 detail">详情</a>\
                                    <a href="' + data[i].下载地址 + '" target="_blank" class="mr-3 downurl">下载</a>\
                                    <span class="filesize">' + data[i].文件大小 + '</span>\
                                </div>\
                            </div>\
                        </div>'
    }
    $('.softlist').append(html)
    $('.softlist a.detail').unbind().click(function () {
        $('#softInfo').modal('show')
        $('#softInfo .modal-body').hide()
        $('#softInfo .loading').show()
        var detail = $(this).attr('rel')
        var ele = $(this)
        var url = 'https://quickso.cn/api/qqpc/getInfo.php?detail=' + encodeURIComponent(detail) + '&t=' + new Date().getTime()
        $.getJSON(url, function (data) {
            $('#softInfo .loading').hide()
            var type = data.type
            var parentEle = ele.parent('.media-body').parent('.media')
            var title = parentEle.find('h4').text()
            var logo = parentEle.find('img').attr('src')
            var url = parentEle.find('a.downurl').attr('href')
            var filesize = parentEle.find('span.filesize').text()
            ele = $('#softInfo')
            ele.find('.modal-body').show()
            ele.find('.modal-body h4').text(title)
            ele.find('img.logo').attr('src', logo)
            ele.find('a.download').attr('href', url)
            if (type == 1) {
                // 只有一张图的形式
                var version = parentEle.attr('rel')
                ele.find('.modal-body p').html('大小：' + filesize + '<span class="ml-3">版本：' + version + '</span>')
                ele.find('tr.imgs').html('<img src="' + data.imgu + '" class="img-fluid rounded" />')
                // 清空软件介绍文字
                ele.find('.modal-body .softMsg').html('')
            } else {
                // 多图水平滚动形式
                ele.find('.modal-body p').html(
                    '<span style="font-size: 15px;">时间：' + data.time +
                    '&nbsp;&nbsp;&nbsp;&nbsp;大小：' + data.filesize +
                    '<br />版本：' + data.version +
                    '&nbsp;&nbsp;&nbsp;&nbsp;位数：' + data.wei +
                    '<br />支持系统：' + data.sup + '</span>'
                )
                ele.find('.modal-body .softMsg').html(data.msg)
                var html = ''
                for (var i = 0; i < data.imgu.length; i++) {
                    html += '<td><img src="' + data.imgu[i] + '" class="rounded" /></td>'
                }
                ele.find('tr.imgs').html(html)
            }

        })
    })
}

function loadPage(typeId, page) {
    $('.morePage').text('正在加载中').show()
    if (page == 1) {
        $('.softlist').html('')
    }
    sessionStorage.typeId = typeId
    sessionStorage.nowpage = page
    // 正在加载中
    sessionStorage.loading = 1
    var url = 'https://s.pcmgr.qq.com/tapi/web/softlistcgi.php?callback=?&c=' + typeId + '&sort=0&offset=' + (page - 1) * 24 + '&limit=24&noplugin=0'
    $.getJSON(url, function (data) {
        var list = data.list
        for (var i = 0; i < list.length; i++) {
            var item = list[i]
            listdata[i] = {
                '名称': item.sn,
                '文件大小': item.fs,
                '图标': 'http:' + item.lg,
                '下载地址': item.url,
                '版本号': item.ver,
                '评分': item.star,
                '详情地址': item.detailUrl
            }
        }
        showList(listdata)
        // 完成加载
        $('.morePage').text('加载更多')
        sessionStorage.loading = 0
    })
}

function search(keyword, page) {
    $('.morePage').text('正在加载中').show()
    if (page == 1) {
        $('.softlist').html('')
    }
    sessionStorage.typeId = 'search'
    sessionStorage.nowpage = page
    sessionStorage.keyword = keyword
    var url = 'https://s.pcmgr.qq.com/tapi/web/searchcgi.php?type=search&callback=?&keyword=' + encodeURIComponent(keyword) + '&page=' + page + '&pernum=30&more=0'
    $.getJSON(url, function (data) {
        var ismore = data.info.ismore
        if (ismore == 0) {
            $('.morePage').hide()
        }
        var list = data.list
        for (var i = 0; i < list.length; i++) {
            var item = list[i]
            var xml = item.xmlInfo.replace(/\s/g, '')
            var filesize = xml.split('<filesize>')[1].split('</filesize>')[0]
            var logo = 'https://pc3.gtimg.com/softmgr/logo/48/' + xml.split('<logo48>')[1].split('</logo48>')[0]
            var url = xml.split('<https><![CDATA[')[1].split(']')[0]
            var star = xml.split('<point>')[1].split('</point>')[0]
            var id = xml.split('<softid="')[1].split('"')[0]
            var detail = '/detail/' + parseInt(id) % 20 + '/detail_' + id + '.html'
            var version = xml.split('<versionname>')[1].split('</versionname>')[0]
            console.log(detail)
            listdata[i] = {
                '名称': item.SoftName,
                '文件大小': byteToString(parseFloat(filesize)),
                '图标': logo,
                '下载地址': url,
                '版本号': version,
                '评分': star,
                '详情地址': detail
            }
        }
        showList(listdata)
        // 完成加载
        $('.morePage').text('加载更多')
        sessionStorage.loading = 0
    })
}

function loadTypes() {
    // 添加软件分类标签列表
    var types = [
        { "标题": "全部", "id": "0" },
        { "标题": "腾讯专区", "id": "99" },
        { "标题": "游戏", "id": "16" },
        { "标题": "视频", "id": "5" },
        { "标题": "浏览器", "id": "3" },
        { "标题": "聊天", "id": "1" },
        { "标题": "输入法", "id": "2" },
        { "标题": "下载", "id": "4" },
        { "标题": "音乐", "id": "6" },
        { "标题": "图片", "id": "7" },
        { "标题": "安全", "id": "8" },
        { "标题": "解压刻录", "id": "9" },
        { "标题": "系统", "id": "10" },
        { "标题": "驱动", "id": "11" },
        { "标题": "办公", "id": "12" },
        { "标题": "编程", "id": "13" },
        { "标题": "股票网银", "id": "14" },
        { "标题": "剪辑", "id": "15" },
        { "标题": "网络", "id": "17" },
        { "标题": "桌面", "id": "18" }
    ]
    var html = '软件分类：'
    for (var i = 0; i < types.length; i++) {
        var title = types[i].标题
        var id = types[i].id
        html += '<button class="btn btn-light mr-1 mb-1" rel="' + id + '">' + title + '</button>'
    }
    $('.type-btns').html(html)
    $('.type-btns button').click(function () {
        // 判断上一次是否加载完成
        if (sessionStorage.loading == '0') {
            var id = $(this).attr('rel')
            loadPage(id, 1)
        }
    })
}
function setAlert(data) {
    $('.alertInfo').html('<div class="alert alert-success mt-2 alert-dismissible fade show">\
                            <button type="button" class="close" data-dismiss="alert">&times;</button>' + data +
        '</div>')
}
// 开发笔记：写jQuery的时候一定别忘了写$(document).ready()
$(document).ready(function () {
    $('.morePage').click(function () {
        if (sessionStorage.typeId == 'search') {
            // 判断上一次是否加载完成
            if (sessionStorage.loading == '0') {
                var page = parseInt(sessionStorage.nowpage) + 1
                search(sessionStorage.keyword, page)
            }
        } else {
            // 判断上一次是否加载完成
            if (sessionStorage.loading == '0') {
                var page = parseInt(sessionStorage.nowpage) + 1
                loadPage(sessionStorage.typeId, page)
            }
        }

    })
    $('.search').click(function () {
        if (sessionStorage.loading == '0') {
            var keyword = $('.keyword').val()
            if (keyword != '') {
                search(keyword, 1)
            }
        }
    })
    // 点击展开公告、日志、关于
    $('a.gonggao').click(function () {
        setAlert(
            '我们很多时候下载电脑软件需要到软件官网进行下载，\
             但是很多国外网站存在\
             <strong>国内无法访问</strong>或者<strong>下载速度缓慢</strong>等问题， 国内软件下载站又存在\
             <strong>病毒风险</strong>， 本站为了解决这个问题， 无需翻墙， 即可轻松下载您需要的各种电脑软件。\
             <div style="text-align: right;">  <a href="https://shssedu.ac.cn"><strong>SHSSEDU</strong></a></div>'
        )
    })
    $('a.log').click(function () {
        setAlert(
            '<strong>开发日志</strong>\
             <ul>\
                 <li>2023.09.22 网站上线</li>\
             </ul>'
        )
    })
    $('a.about').click(function () {
        setAlert(
            '资源来源于腾讯软件中心，\
            软件仅供内部人员学习交流使用，\
            有任何疑问欢迎邮箱联系：admin@shssedu.ac.cn'
        )
    })
    // 添加软件分类组件
    loadTypes()
    loadPage(0, 1)
})