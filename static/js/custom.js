// 功能
$(document).ready(function() {
  var chatBtn = $('#chatBtn');
  var chatInput = $('#chatInput');
  var chatWindow = $('#chatWindow');
  
  // 全局变量,存储对话信息
  var messages = [];

  // 创建自定义渲染器
  const renderer = new marked.Renderer();

  // 重写list方法
  renderer.list = function(body, ordered, start) {
    const type = ordered ? 'ol' : 'ul';
    const startAttr = (ordered && start) ? ` start="${start}"` : '';
    return `<${type}${startAttr}>\n${body}</${type}>\n`;
  };

  // 设置marked选项
  marked.setOptions({
    renderer: renderer,
    highlight: function (code, language) {
      const validLanguage = hljs.getLanguage(language) ? language : 'javascript';
      return hljs.highlight(code, { language: validLanguage }).value;
    }
  });

  // 转义html代码(对应字符转移为html实体)，防止在浏览器渲染
  function escapeHtml(html) {
    let text = document.createTextNode(html);
    let div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
  }

  
  // 添加请求消息到窗口
  function addRequestMessage(message) {
    chatInput.val('');
    let escapedMessage = escapeHtml(message);  // 对请求message进行转义，防止输入的是html而被浏览器渲染
    let requestMessageElement = $('<div class="message-bubble"><span class="chat-icon request-icon"></span><div class="message-text request"><p>' +  escapedMessage + '</p></div></div>');
    chatWindow.append(requestMessageElement);
    let responseMessageElement = $('<div class="message-bubble"><span class="chat-icon response-icon"></span><div class="message-text response"><span class="loading-icon"><i class="fa fa-spinner fa-pulse fa-2x"></i></span></div></div>');
    chatWindow.append(responseMessageElement);
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
  }
  

  // 添加响应消息到窗口,流式响应此方法会执行多次
  function addResponseMessage(message) {
    let lastResponseElement = $(".message-bubble .response").last();
    lastResponseElement.empty();
    if ($(".answer .others .center").css("display") === "none") {
      $(".answer .others .center").css("display", "flex");
    }
    let escapedMessage;
    // 处理流式消息中的代码块
    let codeMarkCount = 0;
    let index = message.indexOf('```');
    while (index !== -1) {
      codeMarkCount ++ ;
      index = message.indexOf('```', index + 3);
    }
    if(codeMarkCount % 2 == 1  ){  // 有未闭合的 code
      escapedMessage = marked.parse(message + '\n\n```'); 
    }else if(codeMarkCount % 2 == 0 && codeMarkCount != 0){
      escapedMessage = marked.parse(message);  // 响应消息markdown实时转换为html
    }else if(codeMarkCount == 0){  // 输出的代码有可能不是markdown格式，所以只要没有markdown代码块的内容，都用escapeHtml处理后再转换
      escapedMessage = marked.parse(escapeHtml(message));
    }
    lastResponseElement.append(escapedMessage);
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
  }

  // 添加失败信息到窗口
  function addFailMessage(message) {
    let lastResponseElement = $(".message-bubble .response").last();
    lastResponseElement.empty();
    lastResponseElement.append('<p class="error">' + message + '</p>');
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
    messages.pop() // 失败就让用户输入信息从数组删除
  }

  // 定义一个变量保存axios请求对象
  let axiosRequest;
  
  // 处理用户输入
  chatBtn.click(function() {
    axiosRequest = axios.CancelToken.source();
    // 解绑键盘事件
    chatInput.off("keydown",handleEnter);
    
    // 判断消息是否是正常的标志变量
    let resFlag = true;

    // 接收输入信息变量
    let message = chatInput.val();
    if (message.length == 0){
      // 重新绑定键盘事件
      chatInput.on("keydown",handleEnter);
      return ;
    }

    addRequestMessage(message);
    // 将用户消息保存到数组
    messages.push({"role": "user", "content": message})
    // 收到回复前让按钮不可点击
    chatBtn.attr('disabled',true)

    if(messages.length>40){
      addFailMessage("此次对话长度过长，请点击下方删除按钮清除对话内容！");
      // 重新绑定键盘事件
      chatInput.on("keydown",handleEnter);
      chatBtn.attr('disabled',false) // 让按钮可点击
      return ;
    }

    let postData = {
      question: messages[messages.length - 1].content
    };
    let conversationId = localStorage.getItem('conversationId')
    if (conversationId) {
      postData['conversationId'] = conversationId;
    }
    // 发送信息到后台
    axios({
      url: "https://ghpzwj.laf.dev/api",
      method: "post",
      data: postData,
      cancelToken: axiosRequest.token,
      responseType: "stream",
      onDownloadProgress: function (progressEvent) {
        const xhr = progressEvent.event.target;
        const { responseText } = xhr;
        progress(responseText);
      },
    })
    .then((response) => {
      let result;
      const lastIndex = response.data.lastIndexOf("⭐");
      if (lastIndex !== -1) {
        result = JSON.parse(response.data.substring(lastIndex + 1));
      }
      localStorage.setItem("conversationId", result.conversationId)
      if(resFlag){
        messages.push({"role": "assistant", "content": result.text});
        // 判断是否本地存储历史会话
        if(localStorage.getItem('archiveSession')=="true"){
          localStorage.setItem("session",JSON.stringify(messages));
        }
      }
    })
    .catch((err) => {
      if (axios.isCancel(err)) {
        addFailMessage('请求被取消!');
      } else {
        addFailMessage('出错啦！请稍后再试!');
      }
    }).finally(() => {
      // 收到回复，让按钮可点击
      chatBtn.attr('disabled',false)
      // 重新绑定键盘事件
      chatInput.on("keydown",handleEnter); 
      axiosRequest = null;
      $(".answer .others .center").css("display","none");
      // 添加复制
      copy();
    });
  });

  function progress(responseText) {
    const lastIndex = responseText.lastIndexOf("⭐");
    if (lastIndex !== -1) {
      chunk = responseText.substring(lastIndex + 1);
    }
    let resJsonObj;
    try{
      resJsonObj = JSON.parse(chunk);  // 只有错误信息是json类型字符串,且一次返回
      if(resJsonObj.hasOwnProperty("error")){
        addFailMessage(resJsonObj.error.type + " : " + resJsonObj.error.message + " " + resJsonObj.error.code);
        resFlag = false;
      }else{
        addResponseMessage(resJsonObj.text);
      }
    }catch(e){
      addResponseMessage(chunk);
    }
  }

  // 停止输出
  $('.stop a').click(function() {
    console.log(axiosRequest);
    if(axiosRequest){
      axiosRequest.cancel("operation canceled");
    }
  })

  // Enter键盘事件
  function handleEnter(e){
    if (e.keyCode==13){
      chatBtn.click();
      e.preventDefault();  //避免回车换行
    }
  }

  // 绑定Enter键盘事件
  chatInput.on("keydown",handleEnter);

  // 设置栏宽度自适应
  let width = $('.function .others').width();
  $('.function .settings .dropdown-menu').css('width', width);
  
  $(window).resize(function() {
    width = $('.function .others').width();
    $('.function .settings .dropdown-menu').css('width', width);
  });

  // 主题
  function setBgColor(theme){
    $(':root').attr('bg-theme', theme);
    $('.settings-common .theme').val(theme);
    // 定位在文档外的元素也同步主题色
    $('.settings-common').css('background-color', 'var(--bg-color)');
  }
  
  let theme = localStorage.getItem('theme');
  // 如果之前选择了主题，则将其应用到网站中
  if (theme) {
    setBgColor(theme);
  }else{
    localStorage.setItem('theme', "light"); //默认的主题
    theme = localStorage.getItem('theme');
    setBgColor(theme);
  }

  // 监听主题选择的变化
  $('.settings-common .theme').change(function() {
    const selectedTheme = $(this).val();
    localStorage.setItem('theme', selectedTheme);
    $(':root').attr('bg-theme', selectedTheme);
    // 定位在文档外的元素也同步主题色
    $('.settings-common').css('background-color', 'var(--bg-color)');
  });

  // 是否保存历史对话
  var archiveSession = localStorage.getItem('archiveSession');

  // 初始化archiveSession
  if(archiveSession == null){
    archiveSession = "false";
    localStorage.setItem('archiveSession', archiveSession);
  }
  
  if(archiveSession == "true"){
    $("#chck-1").prop("checked", true);
  }else{
    $("#chck-1").prop("checked", false);
  }

  $('#chck-1').click(function() {
    if ($(this).prop('checked')) {
      // 开启状态的操作
      localStorage.setItem('archiveSession', true);
      if(messages.length != 0){
        localStorage.setItem("session",JSON.stringify(messages));
      }
    } else {
      // 关闭状态的操作
      localStorage.setItem('archiveSession', false);
      localStorage.removeItem("session");
    }
  });
  
  // 加载历史保存会话
  if(archiveSession == "true"){
    const messagesList = JSON.parse(localStorage.getItem("session"));
    if(messagesList){
      messages = messagesList;
      $.each(messages, function(index, item) {
        if (item.role === 'user') {
          addRequestMessage(item.content)
        } else if (item.role === 'assistant') {
          addResponseMessage(item.content)
        }
      });
      $(".answer .others .center").css("display", "none");
      // 添加复制
      copy();
    }
  }

  // 删除功能
  $(".delete a").click(function(){
    chatWindow.empty();
    $(".answer .tips").css({"display":"flex"});
    messages = [];
    localStorage.removeItem("session");
  });

  // 截图功能
  $(".screenshot a").click(function() {
    // 创建副本元素
    const clonedChatWindow = chatWindow.clone();
    clonedChatWindow.css({
      position: "absolute",
      left: "-9999px",
      overflow: "visible",
      width: chatWindow.width(),
      height: "auto"
    });
    $("body").append(clonedChatWindow);
    // 截图
    html2canvas(clonedChatWindow[0], {
      allowTaint: false,
      useCORS: true,
      scrollY: 0,
    }).then(function(canvas) {
      // 将 canvas 转换成图片
      const imgData = canvas.toDataURL('image/png');
      // 创建下载链接
      const link = document.createElement('a');
      link.download = "screenshot_" + Math.floor(Date.now() / 1000) + ".png";
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      clonedChatWindow.remove();
    });
  });

  // 复制代码功能
  function copy(){
    $('pre').each(function() {
      let btn = $('<button class="copy-btn">复制</button>');
      $(this).append(btn);
      btn.hide();
    });

    $('pre').hover(
      function() {
        $(this).find('.copy-btn').show();
      },
      function() {
        $(this).find('.copy-btn').hide();
      }
    );

    $('pre').on('click', '.copy-btn', function() {
      let text = $(this).siblings('code').text();
      // 创建一个临时的 textarea 元素
      let textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);

      // 选择 textarea 中的文本
      textArea.select();

      // 执行复制命令
      try {
        document.execCommand('copy');
        $(this).text('复制成功');
      } catch (e) {
        $(this).text('复制失败');
      }

      // 从文档中删除临时的 textarea 元素
      document.body.removeChild(textArea);

      setTimeout(() => {
        $(this).text('复制');
      }, 2000);
    });
  }

  // 励志语录
  function incentive() {
    $.ajax({
      url: 'https://cxvkeq.laf.dev/claudeChat',
      method: 'GET',
      data: {
        question: "生成一个二十字以内的励志语录。注意：只需要给我语录内容，不需要你携带其他语句"
      },
      xhrFields: {
        onprogress: function(e) {
          let resJsonObj = JSON.parse(e.target.responseText);
          $("#incentive").html(resJsonObj.msg)
        }
      }
    });
  }
  incentive();
});