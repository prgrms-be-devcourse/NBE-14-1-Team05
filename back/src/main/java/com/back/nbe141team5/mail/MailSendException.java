package com.back.nbe141team5.mail;

// 메일 발송 실패를 나타내는 예외. 원인 예외(cause)를 함께 보관한다.
public class MailSendException extends RuntimeException {

    public MailSendException(String to, Throwable cause) {
        super("이메일 전송에 실패했습니다. to=" + to, cause);
    }
}
