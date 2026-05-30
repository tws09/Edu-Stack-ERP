import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import '../storage/secure_storage.dart';
import 'auth_interceptor.dart';

class DioClient {
  DioClient._();

  static Dio? _instance;
  static final _secureStorage = SecureStorageService();

  static Dio get instance {
    _instance ??= _createDio();
    return _instance!;
  }

  static Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          ApiConstants.clientTypeHeader: ApiConstants.clientTypeValue,
        },
      ),
    );

    dio.interceptors.addAll([
      AuthInterceptor(dio: dio, secureStorage: _secureStorage),
      LogInterceptor(
        requestBody: false,
        responseBody: false,
        logPrint: (o) => debugPrint('[DIO] $o'),
      ),
    ]);

    return dio;
  }

  // Reset singleton (e.g. after logout)
  static void reset() => _instance = null;
}
