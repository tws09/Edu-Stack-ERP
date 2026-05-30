class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final Map<String, dynamic>? meta;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.meta,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromData,
  ) {
    return ApiResponse(
      success: json['success'] as bool,
      data: json['data'] != null && fromData != null
          ? fromData(json['data'])
          : null,
      message: json['message'] as String?,
      meta: json['meta'] as Map<String, dynamic>?,
    );
  }
}
