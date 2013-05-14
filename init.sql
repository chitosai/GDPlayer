
-- phpMyAdmin SQL Dump
-- version 2.10.2
-- http://www.phpmyadmin.net
-- 
-- 主机: localhost
-- 生成日期: 2013 年 05 月 14 日 07:02
-- 服务器版本: 5.0.45
-- PHP 版本: 5.2.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

-- 
-- 数据库: `gdplayer`
-- 
DROP DATABASE IF EXISTS `GDPlayer`;
CREATE DATABASE `GDPlayer`;
USE GDPlayer;

-- --------------------------------------------------------

-- 
-- 表的结构 `keywords`
-- 

DROP TABLE IF EXISTS `keywords`;
CREATE TABLE `keywords` (
  `keyword` varchar(64) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='关键词';

-- 
-- 导出表中的数据 `keywords`
-- 

INSERT INTO `keywords` (`keyword`) VALUES ('你妈');
INSERT INTO `keywords` (`keyword`) VALUES ('她妈');
INSERT INTO `keywords` (`keyword`) VALUES ('傻逼');
INSERT INTO `keywords` (`keyword`) VALUES ('共产党');
INSERT INTO `keywords` (`keyword`) VALUES ('游行');

-- --------------------------------------------------------

-- 
-- 表的结构 `user`
-- 

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user` varchar(24) NOT NULL COMMENT '用户名',
  `signature` varchar(73) NOT NULL COMMENT '签名',
  `privilege` tinyint(4) NOT NULL default '6' COMMENT '权限',
  `lastpost` timestamp NOT NULL default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP COMMENT '最后发送弹幕时间',
  PRIMARY KEY  (`user`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- 
-- 导出表中的数据 `user`
-- 

INSERT INTO `user` (`user`, `signature`, `privilege`, `lastpost`) VALUES ('super1', '897bc434ea0eca7e2c18c22ccb80b223d75c4c93b88abebfb5b9f521bb9a500d', 9, '2013-04-18 16:11:31');
INSERT INTO `user` (`user`, `signature`, `privilege`, `lastpost`) VALUES ('super2', '99511305183bb9f48a8a04475cde00f0e2137f512d3a78005a6b7ab7aea8d3ed', 9, '2013-04-18 16:11:31');
INSERT INTO `user` (`user`, `signature`, `privilege`, `lastpost`) VALUES ('normal1', 'ace37e2619ce60f3fa6c35daf1ca588ce824a8371f8d4dca59171ae7ab1fdb3f', 6, '2013-05-14 15:01:58');
INSERT INTO `user` (`user`, `signature`, `privilege`, `lastpost`) VALUES ('normal2', '825b14b1b03ddcfde39fc2d81f50885ec6e9b93f95d409de9d47de377212f31e', 6, '2013-04-18 16:12:06');
INSERT INTO `user` (`user`, `signature`, `privilege`, `lastpost`) VALUES ('blocked1', 'c10e9f4df77d34fd63fb4fc8161222eecdd4e5ec2a3fea58a81a625dd3e762fe', 0, '2013-04-18 16:12:27');
